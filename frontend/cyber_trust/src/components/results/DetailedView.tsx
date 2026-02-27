import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { FindingCard } from './FindingCard';
import { ManifestViewer } from './ManifestViewer';
import { getRiskTextColor } from '../../utils/colors';

interface DetailedViewProps {
    analysis: AnalysisResult;
    onSwitchToSimple: () => void;
}

export const DetailedView: React.FC<DetailedViewProps> = ({ analysis, onSwitchToSimple }) => {
    const { report, aiAnalysis, rawData } = analysis;
    const categories = report.categories;
    const embeddedUrls = rawData?.embeddedUrls || [];
    const manifest = rawData?.manifest || {};

    const [activeTab, setActiveTab] = useState<'critical' | 'high' | 'medium' | 'low'>('critical');
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [showAllUrls, setShowAllUrls] = useState(false);

    const tabs: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    const tabCounts = {
        critical: categories.critical.length,
        high: categories.high.length,
        medium: categories.medium.length,
        low: categories.low.length
    };

    return (
        <div className="space-y-8">

            {/* Switch to Simple */}
            <div className="text-center">
                <button
                    onClick={onSwitchToSimple}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                    ← Back to Simple View
                </button>
            </div>

            {/* Risk Level Card */}
            <Card className="border-blue-600/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20 overflow-hidden">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wider">Overall Risk</p>
                            <h2 className={`text-5xl font-bold mt-2 ${getRiskTextColor(report.overallRisk)}`}>
                                {report.overallRisk}
                            </h2>
                        </div>
                        <div className="text-right">
                            <Badge variant={report.overallRisk.toLowerCase() as 'critical' | 'high' | 'medium' | 'low' | 'safe'} size="lg">
                                Score: {report.riskScore}/100
                            </Badge>
                            <p className="text-slate-400 text-sm mt-2">{report.riskPercentage}% Risk</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-slate-400">Security Score</p>
                        <ProgressBar value={report.riskScore} max={100} animated={true} />
                    </div>
                    <div className="pt-4 border-t border-slate-700/50">
                        <p className="text-slate-300 text-lg">{report.summary}</p>
                    </div>
                </div>
            </Card>

            {/* TLDR — AI Analysis */}
            {aiAnalysis && (
                <Card className="border-purple-600/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 overflow-hidden">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🤖</span>
                                <div>
                                    <h3 className="text-xl font-bold text-purple-200">TLDR</h3>
                                    <p className="text-purple-400 text-xs">Powered by Google Gemini</p>
                                </div>
                            </div>
                            {aiAnalysis.riskLevel && (
                                <Badge
                                    variant={
                                        aiAnalysis.riskLevel.toLowerCase() === 'critical' ? 'critical' :
                                            aiAnalysis.riskLevel.toLowerCase() === 'high' ? 'high' :
                                                aiAnalysis.riskLevel.toLowerCase() === 'medium' ? 'medium' :
                                                    aiAnalysis.riskLevel.toLowerCase() === 'low' ? 'low' : 'safe'
                                    }
                                    size="md"
                                >
                                    AI: {aiAnalysis.riskLevel}
                                </Badge>
                            )}
                        </div>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-800/30 rounded-xl p-4 border border-purple-700/20">
                            {aiAnalysis.summary}
                        </div>
                    </div>
                </Card>
            )}

            {/* Findings Tabs */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Detailed Findings</h3>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tabCounts[tab]})
                            </button>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {categories[activeTab].length === 0 ? (
                            <Card className="border-green-600/30 bg-green-900/20 text-center py-8">
                                <p className="text-green-200 font-semibold">✅ No {activeTab} risk findings!</p>
                            </Card>
                        ) : (
                            categories[activeTab].map((finding, index) => (
                                <FindingCard
                                    key={`${finding.title}-${index}`}
                                    finding={finding}
                                    isExpanded={expandedCard === finding.title}
                                    onToggle={() =>
                                        setExpandedCard(expandedCard === finding.title ? null : finding.title)
                                    }
                                    index={index}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
                <Card className="border-amber-600/30 bg-amber-900/20">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-amber-200">📋 Recommendations</h3>
                        <ul className="space-y-2">
                            {report.recommendations.map((rec, index) => (
                                <li
                                    key={index}
                                    className="flex gap-3 text-amber-300/90 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span className="flex-shrink-0">→</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            )}

            {/* Embedded URLs */}
            {embeddedUrls.length > 0 && (
                <Card className="border-cyan-600/30 bg-cyan-900/10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🔗</span>
                                <h3 className="text-xl font-bold text-cyan-200">
                                    Embedded URLs ({embeddedUrls.length})
                                </h3>
                            </div>
                            {embeddedUrls.length > 5 && (
                                <button
                                    onClick={() => setShowAllUrls(!showAllUrls)}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    {showAllUrls ? 'Show less' : `Show all ${embeddedUrls.length}`}
                                </button>
                            )}
                        </div>
                        <div className="space-y-1.5 max-h-80 overflow-y-auto">
                            {(showAllUrls ? embeddedUrls : embeddedUrls.slice(0, 5)).map((url, index) => (
                                <div
                                    key={index}
                                    className="text-sm text-cyan-300/80 bg-slate-800/40 px-3 py-1.5 rounded-lg font-mono truncate hover:text-cyan-200 transition-colors"
                                    title={url}
                                >
                                    {url}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Raw Manifest */}
            <ManifestViewer manifest={manifest} />
        </div>
    );
};
