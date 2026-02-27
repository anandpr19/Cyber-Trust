import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface DashboardData {
    stats: {
        totalScans: number;
        uniqueExtensions: number;
        averageScore: number;
    };
    riskDistribution: Record<string, number>;
    topExtensions: Array<{
        extensionId: string;
        name: string;
        score: number;
        scanCount: number;
        lastScanned: string;
        icon?: string;
        author?: string;
    }>;
    recentScans: Array<{
        extensionId: string;
        name: string;
        score: number;
        scannedAt: string;
        icon?: string;
        riskLevel: string;
    }>;
}

function getRiskBadgeVariant(level: string): 'critical' | 'high' | 'medium' | 'low' | 'safe' {
    const l = level.toLowerCase();
    if (l === 'critical') return 'critical';
    if (l === 'high') return 'high';
    if (l === 'medium') return 'medium';
    if (l === 'low') return 'low';
    return 'safe';
}

function getScoreColor(score: number): string {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 25) return 'text-orange-400';
    return 'text-red-400';
}

// CSS donut chart colors
const RISK_COLORS: Record<string, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6',
    SAFE: '#22c55e'
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
            if (!signal?.aborted) {
                setData(result);
            }
        } catch (err) {
            if (!signal?.aborted) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard');
            }
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
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
                    <p className="text-slate-300">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
                <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
                    <Card className="border-red-600/50 bg-red-900/20">
                        <p className="text-red-200 font-semibold">❌ {error || 'Failed to load dashboard'}</p>
                    </Card>
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
    const totalRisk = Object.values(riskDistribution).reduce((a, b) => a + b, 0);

    // Build conic gradient for donut chart
    let gradientParts: string[] = [];
    let cumulative = 0;
    for (const [level, count] of Object.entries(riskDistribution)) {
        if (count === 0) continue;
        const pct = (count / Math.max(totalRisk, 1)) * 100;
        gradientParts.push(`${RISK_COLORS[level] || '#64748b'} ${cumulative}% ${cumulative + pct}%`);
        cumulative += pct;
    }
    const conicGradient = gradientParts.length > 0
        ? `conic-gradient(${gradientParts.join(', ')})`
        : 'conic-gradient(#334155 0% 100%)';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8 animate-fade-in">

                    {/* Header */}
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">📊 Public Dashboard</h1>
                        <p className="text-slate-400">Overview of all extensions analyzed by Cyber-Trust</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Scans', value: stats.totalScans, icon: '🔍' },
                            { label: 'Unique Extensions', value: stats.uniqueExtensions, icon: '🧩' },
                            { label: 'Average Score', value: `${stats.averageScore}/100`, icon: '📈' },
                            { label: 'Risk Levels', value: totalRisk, icon: '🛡️' },
                        ].map((stat, i) => (
                            <Card key={i} className="border-slate-700/50 bg-slate-800/50 text-center">
                                <div className="space-y-1">
                                    <span className="text-2xl">{stat.icon}</span>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Risk Distribution Donut + Most Analyzed */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Risk Donut */}
                        <Card className="border-slate-700/50 bg-slate-800/40">
                            <h3 className="text-xl font-bold text-white mb-6">Risk Distribution</h3>
                            <div className="flex items-center gap-8">
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-36 h-36 rounded-full"
                                        style={{ background: conicGradient }}
                                    />
                                    {/* Inner hole for donut effect */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-800" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">{totalRisk}</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {Object.entries(riskDistribution).map(([level, count]) => (
                                        <div key={level} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ background: RISK_COLORS[level] || '#64748b' }}
                                                />
                                                <span className="text-slate-300">{level}</span>
                                            </div>
                                            <span className="text-white font-semibold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Most Analyzed */}
                        <Card className="border-slate-700/50 bg-slate-800/40">
                            <h3 className="text-xl font-bold text-white mb-4">🔥 Most Analyzed</h3>
                            {topExtensions.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">No extensions analyzed yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {topExtensions.slice(0, 5).map((ext, i) => (
                                        <div
                                            key={ext.extensionId}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/40 transition-colors cursor-pointer"
                                            onClick={() => {
                                                // Could navigate to a cached results page
                                            }}
                                        >
                                            <span className="text-slate-500 text-sm font-mono w-5 text-right">
                                                #{i + 1}
                                            </span>
                                            {ext.icon ? (
                                                <img
                                                    src={ext.icon}
                                                    alt=""
                                                    className="w-8 h-8 rounded-lg"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm">🧩</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{ext.name}</p>
                                                {ext.author && (
                                                    <p className="text-slate-500 text-xs truncate">by {ext.author}</p>
                                                )}
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <span className={`text-sm font-bold ${getScoreColor(ext.score)}`}>
                                                    {ext.score}
                                                </span>
                                                <span className="text-slate-500 text-xs bg-slate-700/60 px-2 py-0.5 rounded-full">
                                                    {ext.scanCount}×
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Recent Scans */}
                    <Card className="border-slate-700/50 bg-slate-800/40">
                        <h3 className="text-xl font-bold text-white mb-4">🕐 Recent Scans</h3>
                        {recentScans.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No scans performed yet. <a href="/upload" className="text-blue-400 hover:text-blue-300">Analyze your first extension →</a></p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="text-left py-3 px-2 text-slate-400 font-medium">Extension</th>
                                            <th className="text-center py-3 px-2 text-slate-400 font-medium">Risk</th>
                                            <th className="text-center py-3 px-2 text-slate-400 font-medium">Score</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Scanned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentScans.map((scan, i) => (
                                            <tr
                                                key={`${scan.extensionId}-${i}`}
                                                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                                            >
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-2">
                                                        {scan.icon ? (
                                                            <img src={scan.icon} alt="" className="w-6 h-6 rounded"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        ) : (
                                                            <span>🧩</span>
                                                        )}
                                                        <span className="text-white font-medium truncate max-w-[200px]">
                                                            {scan.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <Badge variant={getRiskBadgeVariant(scan.riskLevel)} size="sm">
                                                        {scan.riskLevel}
                                                    </Badge>
                                                </td>
                                                <td className={`py-3 px-2 text-center font-bold ${getScoreColor(scan.score)}`}>
                                                    {scan.score}
                                                </td>
                                                <td className="py-3 px-2 text-right text-slate-400">
                                                    {new Date(scan.scannedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    {/* CTA */}
                    <div className="text-center pt-4">
                        <button
                            onClick={() => navigate('/upload')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
                        >
                            🔍 Analyze an Extension
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
