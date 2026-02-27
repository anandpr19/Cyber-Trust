import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, CheckCircle, Activity, ArrowRight, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { apiClient } from '../services/api';

interface DashboardData {
    stats: { totalScans: number; uniqueExtensions: number; averageScore: number; };
    riskDistribution: { critical: number; high: number; medium: number; low: number; CRITICAL?: number; HIGH?: number; MEDIUM?: number; LOW?: number; SAFE?: number; };
    topExtensions: Array<{ extensionId: string; name: string; icon?: string; scanCount: number; score: number; }>;
    recentScans: Array<{ extensionId: string; name: string; icon?: string; score: number; riskLevel: string; scannedAt: string; }>;
}

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
    }),
};

const scoreColor = (s: number) => {
    if (s >= 75) return 'text-green-400';
    if (s >= 50) return 'text-amber-400';
    if (s >= 25) return 'text-orange-400';
    return 'text-red-400';
};

const riskBadge = (level: string) => {
    const styles: Record<string, string> = {
        CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/25',
        HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
        MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
        LOW: 'bg-green-500/15 text-green-400 border-green-500/25',
    };
    return styles[level] || styles.MEDIUM;
};

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = async (signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await apiClient.getDashboard();
            if (!signal?.aborted) setData(result);
        } catch (err) {
            if (!signal?.aborted) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchDashboard(controller.signal);
        return () => controller.abort();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-slate-300 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
                <div className="max-w-6xl mx-auto px-4 text-center space-y-4 py-20">
                    <Shield size={40} className="text-slate-500 mx-auto mb-4" strokeWidth={1} />
                    <p className="text-slate-400 font-medium">{error || 'Failed to load dashboard'}</p>
                    <button
                        onClick={() => fetchDashboard()}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                        🔄 Try Again
                    </button>
                </div>
            </div>
        );
    }

    const { stats, riskDistribution, topExtensions, recentScans } = data;
    const rd = {
        critical: riskDistribution.critical || riskDistribution.CRITICAL || 0,
        high: riskDistribution.high || riskDistribution.HIGH || 0,
        medium: riskDistribution.medium || riskDistribution.MEDIUM || 0,
        low: riskDistribution.low || riskDistribution.LOW || 0,
    };
    const totalRisk = rd.critical + rd.high + rd.medium + rd.low;

    const statCards = [
        { icon: BarChart3, label: 'Total Scans', value: stats.totalScans, color: 'text-white' },
        { icon: AlertTriangle, label: 'Critical Found', value: rd.critical, color: 'text-red-400' },
        { icon: CheckCircle, label: 'Unique Extensions', value: stats.uniqueExtensions, color: 'text-green-400' },
        { icon: Activity, label: 'Avg Score', value: stats.averageScore, color: 'text-amber-400' },
    ];

    const sevColors = [
        { label: 'Critical', count: rd.critical, color: '#EF4444', bg: 'bg-red-500' },
        { label: 'High', count: rd.high, color: '#F97316', bg: 'bg-orange-500' },
        { label: 'Medium', count: rd.medium, color: '#EAB308', bg: 'bg-amber-500' },
        { label: 'Low', count: rd.low, color: '#22C55E', bg: 'bg-green-500' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <h1 className="text-[28px] font-bold text-white">Security Dashboard</h1>
                        <p className="text-sm text-slate-400 mt-1">Extension security overview and scan history</p>
                    </div>
                    <button
                        onClick={() => navigate('/upload')}
                        className="group bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
                    >
                        New Scan
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/60 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <stat.icon size={18} className="text-slate-400" strokeWidth={1.5} />
                                <span className="font-mono text-xs text-slate-500">30d</span>
                            </div>
                            <AnimatedCounter
                                target={stat.value}
                                className={`font-mono text-2xl font-bold ${stat.color}`}
                            />
                            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Risk Distribution + Top Extensions Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
                    {/* Risk Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"
                    >
                        <h3 className="text-sm font-semibold text-white mb-1">Risk Distribution</h3>
                        <p className="text-xs text-slate-400 mb-5">Findings by severity</p>

                        {/* Horizontal bar chart */}
                        <div className="space-y-3">
                            {sevColors.map((sev) => {
                                const pct = totalRisk > 0 ? Math.round((sev.count / totalRisk) * 100) : 0;
                                return (
                                    <div key={sev.label}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${sev.bg}`} />
                                                <span className="text-xs text-slate-400">{sev.label}</span>
                                            </div>
                                            <span className="font-mono text-xs text-white">{sev.count} ({pct}%)</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: 0.5 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: sev.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Top Safe Extensions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <ShieldCheck size={16} className="text-green-400" />
                            <h3 className="text-sm font-semibold text-white">Most Analyzed</h3>
                        </div>
                        <div className="space-y-0">
                            {(topExtensions || []).length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">No extensions analyzed yet</p>
                            ) : (
                                (topExtensions || []).slice(0, 5).map((ext, i) => (
                                    <motion.div
                                        key={ext.extensionId}
                                        custom={i}
                                        variants={fadeUp}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {ext.icon ? (
                                                <img src={ext.icon} alt="" className="w-6 h-6 rounded" />
                                            ) : (
                                                <Shield size={16} className="text-slate-500" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{ext.name || ext.extensionId}</p>
                                                <p className="font-mono text-xs text-slate-500">{ext.scanCount} scans</p>
                                            </div>
                                        </div>
                                        <span className={`font-mono text-sm font-bold ${scoreColor(ext.score)}`}>
                                            {ext.score}
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Stats Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <ShieldAlert size={16} className="text-amber-400" />
                            <h3 className="text-sm font-semibold text-white">Score Overview</h3>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className={`font-mono text-5xl font-bold ${scoreColor(stats.averageScore)}`}>
                                {stats.averageScore}
                            </span>
                            <span className="font-mono text-lg text-slate-500">/100</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-6">
                            Average trust score across {stats.totalScans} scans
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">High Risk Scans</span>
                                <span className="text-red-400 font-mono">{rd.critical + rd.high}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Safe Scans</span>
                                <span className="text-green-400 font-mono">{rd.low}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Unique Extensions</span>
                                <span className="text-white font-mono">{stats.uniqueExtensions}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Scans Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-white">Recent Scans</h2>
                        {(recentScans || []).length > 0 && (
                            <span className="bg-slate-800/70 border border-slate-700/50 rounded-md px-3 py-1.5 font-mono text-xs text-slate-400">
                                {(recentScans || []).length} scans
                            </span>
                        )}
                    </div>

                    {(recentScans || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-800/50 border border-slate-700/50 rounded-xl">
                            <Shield size={40} className="text-slate-600 mb-4" strokeWidth={1} />
                            <p className="text-slate-400 mb-1 font-medium">No scans yet</p>
                            <p className="text-xs text-slate-500 mb-6">Upload an extension to see results here</p>
                            <button
                                onClick={() => navigate('/upload')}
                                className="group bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all flex items-center gap-2"
                            >
                                Upload & Analyze
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-[1fr_80px_100px_120px] md:grid-cols-[1fr_80px_100px_120px] gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-700/40">
                                <span>Extension</span>
                                <span>Score</span>
                                <span>Risk</span>
                                <span>Date</span>
                            </div>
                            {/* Table rows */}
                            {(recentScans || []).map((scan, i) => (
                                <motion.div
                                    key={`${scan.extensionId}-${i}`}
                                    custom={i}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="grid grid-cols-[1fr_80px_100px_120px] md:grid-cols-[1fr_80px_100px_120px] gap-4 px-5 py-3 items-center border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {scan.icon ? (
                                            <img src={scan.icon} alt="" className="w-5 h-5 rounded" />
                                        ) : (
                                            <Shield size={14} className="text-slate-500 shrink-0" />
                                        )}
                                        <span className="font-medium text-sm text-white truncate">
                                            {scan.name || scan.extensionId}
                                        </span>
                                    </div>
                                    <span className={`font-mono text-sm font-bold ${scoreColor(scan.score)}`}>
                                        {scan.score}
                                    </span>
                                    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${riskBadge(scan.riskLevel)}`}>
                                        {scan.riskLevel}
                                    </span>
                                    <span className="font-mono text-[13px] text-slate-500">
                                        {new Date(scan.scannedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};
