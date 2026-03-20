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
            <div className="text-center font-mono">
                <button
                    onClick={onSwitchToSimple}
                    className="text-zinc-400 hover:text-zinc-200 text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 border border-white/5 bg-zinc-900/40 px-3 py-1.5 rounded"
                >
                    {'<'} Return_To_Summary
                </button>
            </div>

            {/* Risk Level Card */}
            <Card className="border border-white/5 bg-zinc-900/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="font-mono text-9xl leading-none font-bold text-white tracking-tighter mix-blend-overlay blur-[2px]">{report.riskScore}</span>
                </div>
                <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-2">[OVERALL_RISK]</p>
                            <h2 className={`text-6xl font-display font-bold tracking-tight ${getRiskTextColor(report.overallRisk)}`}>
                                {report.overallRisk}
                            </h2>
                        </div>
                        <div className="text-right">
                            <Badge variant={report.overallRisk.toLowerCase() as 'critical' | 'high' | 'medium' | 'low' | 'safe'} size="lg">
                                SCORE: {report.riskScore}/100
                            </Badge>
                            <p className="text-zinc-500 font-mono text-xs mt-2">{report.riskPercentage}%_VULNERABILITY</p>
                        </div>
                    </div>
                    <div className="space-y-2 mt-8">
                        <div className="flex justify-between items-end">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Security_Score_Progress</p>
                        </div>
                        <ProgressBar value={report.riskScore} max={100} animated={true} />
                    </div>
                    <div className="pt-6 border-t border-white/5">
                        <p className="text-zinc-300 text-lg font-medium">{report.summary}</p>
                    </div>
                </div>
            </Card>

            {/* TLDR — AI Analysis */}
            {aiAnalysis && (
                <Card className="border border-white/5 border-l-2 border-l-blue-500 bg-zinc-900/40 shadow-xl">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400">
                                    <span className="text-blue-500 mr-2">~/</span>
                                    AI_Analysis_Log
                                </h3>
                            </div>
                            {aiAnalysis.riskLevel && (
                                <Badge
                                    variant={
                                        aiAnalysis.riskLevel.toLowerCase() === 'critical' ? 'critical' :
                                            aiAnalysis.riskLevel.toLowerCase() === 'high' ? 'high' :
                                                aiAnalysis.riskLevel.toLowerCase() === 'medium' ? 'medium' :
                                                    aiAnalysis.riskLevel.toLowerCase() === 'low' ? 'low' : 'safe'
                                    }
                                    size="sm"
                                >
                                    AI: {aiAnalysis.riskLevel}
                                </Badge>
                            )}
                        </div>
                        
                        <div className="text-zinc-300 text-sm leading-relaxed space-y-3">
                            {aiAnalysis.summary.split('\n').map((line, idx) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;
                                
                                // Parse out bold headers if the LLM includes them
                                const isHeader = trimmed.endsWith(':') || trimmed.includes('Risk Level:');
                                
                                return (
                                    <p key={idx} className={`${isHeader ? 'font-mono text-xs uppercase tracking-widest text-zinc-100 mt-6 mb-2 border-b border-white/5 pb-1' : 'text-zinc-400 font-medium'} flex gap-3`}>
                                        {trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed) ? (
                                            <span className="text-zinc-700 mt-0.5 font-mono">›</span>
                                        ) : null}
                                        <span>
                                            {trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}
                                        </span>
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}

            {/* Findings Tabs */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-display tracking-tight font-bold text-zinc-100 mb-4 border-b border-white/5 pb-2">Analysis_Report.log</h3>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === tab
                                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                                        : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/20 hover:text-zinc-300'
                                    }`}
                            >
                                {tab} [{tabCounts[tab]}]
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
                <Card className="border border-white/5 bg-zinc-900/40">
                    <div className="space-y-4">
                        <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400 border-b border-white/5 pb-2">Suggested_Actions</h3>
                        <ul className="space-y-2">
                            {report.recommendations.map((rec, index) => (
                                <li
                                    key={index}
                                    className="flex gap-3 text-zinc-300 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span className="flex-shrink-0 text-zinc-500 font-mono">{'>'}</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            )}

            {/* Embedded URLs */}
            {embeddedUrls.length > 0 && (
                <Card className="border border-white/5 bg-zinc-900/40">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400">
                                Discovered_Network_Requests [{embeddedUrls.length}]
                            </h3>
                            {embeddedUrls.length > 5 && (
                                <button
                                    onClick={() => setShowAllUrls(!showAllUrls)}
                                    className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase"
                                >
                                    {showAllUrls ? '[Minimize]' : '[Expand_All]'}
                                </button>
                            )}
                        </div>
                        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                            {(showAllUrls ? embeddedUrls : embeddedUrls.slice(0, 5)).map((url, index) => (
                                <div
                                    key={index}
                                    className="text-xs text-zinc-400 bg-black/40 border border-white/5 px-3 py-2 rounded font-mono truncate hover:text-zinc-200 transition-colors"
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
