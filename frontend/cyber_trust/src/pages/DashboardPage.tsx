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
        <div className="min-h-screen pt-24 pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <h1 className="text-4xl font-display font-bold tracking-tight text-zinc-100 mb-1">Security Dashboard</h1>
                        <p className="text-sm font-mono text-zinc-500">~/Overview & Scan History</p>
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
                            className="bg-zinc-900/40 border border-white/5 rounded p-5 hover:border-white/10 transition-all duration-300 shadow-sm relative overflow-hidden group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <stat.icon size={18} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" strokeWidth={1.5} />
                                <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-600 bg-black/20 px-2 py-0.5 rounded border border-white/5">30d</span>
                            </div>
                            <AnimatedCounter
                                target={stat.value}
                                className={`font-display tracking-tight text-3xl font-bold ${stat.color}`}
                            />
                            <p className="text-xs font-mono tracking-widest uppercase text-zinc-500 mt-2">{stat.label}</p>
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
                        className="bg-zinc-900/40 border border-white/5 rounded p-5 shadow-sm"
                    >
                        <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400 border-b border-white/5 pb-2 mb-4">Risk_Distribution</h3>

                        {/* Horizontal bar chart */}
                        <div className="space-y-3">
                            {sevColors.map((sev) => {
                                const pct = totalRisk > 0 ? Math.round((sev.count / totalRisk) * 100) : 0;
                                return (
                                    <div key={sev.label}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-none opacity-80 ${sev.bg}`} />
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">{sev.label}</span>
                                            </div>
                                            <span className="font-mono text-[10px] text-zinc-300">{sev.count} [{pct}%]</span>
                                        </div>
                                        <div className="h-1.5 bg-black/40 border border-white/5 rounded-none overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: 0.5 }}
                                                className="h-full rounded-none opacity-90"
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
                        className="bg-zinc-900/40 border border-white/5 rounded p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                            <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400">Most_Analyzed</h3>
                        </div>
                        <div className="space-y-0">
                            {(topExtensions || []).length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-4 text-center">No_Extensions_Found</p>
                            ) : (
                                (topExtensions || []).slice(0, 5).map((ext, i) => (
                                    <motion.div
                                        key={ext.extensionId}
                                        custom={i}
                                        variants={fadeUp}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {ext.icon ? (
                                                <img src={ext.icon} alt="" className="w-6 h-6 rounded border border-white/10" />
                                            ) : (
                                                <div className="w-6 h-6 flex items-center justify-center bg-black/40 border border-white/5 rounded">
                                                    <Shield size={12} className="text-zinc-500" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-zinc-200 truncate">{ext.name || ext.extensionId}</p>
                                                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{ext.scanCount}_SCANS</p>
                                            </div>
                                        </div>
                                        <span className={`font-mono text-sm font-bold ${scoreColor(ext.score)} bg-black/40 px-2 py-0.5 rounded border border-white/5`}>
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
                        className="bg-zinc-900/40 border border-white/5 rounded p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                            <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400">Score_Overview</h3>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className={`font-display tracking-tight text-5xl font-bold ${scoreColor(stats.averageScore)}`}>
                                {stats.averageScore}
                            </span>
                            <span className="font-mono text-lg text-zinc-600">/100</span>
                        </div>
                        <p className="text-xs font-mono tracking-widest uppercase text-zinc-500 mb-6">
                            AVG OVER {stats.totalScans} SCANS
                        </p>
                        <div className="space-y-3 font-mono text-xs tracking-widest uppercase">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-zinc-500">High Risk </span>
                                <span className="text-red-400">{rd.critical + rd.high}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-zinc-500">Safe Scans</span>
                                <span className="text-green-400">{rd.low}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500">Unique</span>
                                <span className="text-zinc-300">{stats.uniqueExtensions}</span>
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
                        <h2 className="text-lg font-display tracking-tight font-bold text-zinc-100">Scan_History.log</h2>
                        {(recentScans || []).length > 0 && (
                            <span className="bg-black/40 border border-white/5 rounded px-3 py-1 font-mono text-[10px] tracking-widest uppercase text-zinc-500">
                                {(recentScans || []).length} ENTRIES
                            </span>
                        )}
                    </div>

                    {(recentScans || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/40 border border-white/5 rounded shadow-sm">
                            <p className="font-mono text-zinc-500 mb-6 text-sm">NO_DATA_AVAILABLE</p>
                            <button
                                onClick={() => navigate('/upload')}
                                className="group bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs tracking-widest uppercase px-6 py-2.5 rounded transition-all flex items-center gap-2"
                            >
                                Initiate_Scan
                            </button>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/40 border border-white/5 rounded shadow-sm overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-[1fr_80px_100px_120px] md:grid-cols-[1fr_80px_100px_120px] gap-4 px-5 py-3 text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-black/20">
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
                                    className="grid grid-cols-[1fr_80px_100px_120px] md:grid-cols-[1fr_80px_100px_120px] gap-4 px-5 py-3 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => navigate(`/scan/${scan.extensionId}`)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {scan.icon ? (
                                            <img src={scan.icon} alt="" className="w-6 h-6 rounded border border-white/10" />
                                        ) : (
                                            <div className="w-6 h-6 flex items-center justify-center bg-black/40 border border-white/5 rounded text-zinc-600 text-[10px] font-mono">EXT</div>
                                        )}
                                        <span className="font-medium text-sm text-zinc-200 truncate group-hover:text-blue-400 transition-colors">
                                            {scan.name || scan.extensionId}
                                        </span>
                                    </div>
                                    <span className={`font-mono text-sm font-bold ${scoreColor(scan.score)}`}>
                                        {scan.score}
                                    </span>
                                    <div>
                                        <span className={`inline-flex items-center font-mono text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border bg-black/20 ${riskBadge(scan.riskLevel)}`}>
                                            {scan.riskLevel}
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs text-zinc-500">
                                        {new Date(scan.scannedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
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
