import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnalysisResult } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { getRiskTextColor } from '../utils/colors';
import { FindingCard } from '../components/results/FindingCard';
export const ResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const analysis = location.state?.analysis as AnalysisResult | undefined;

    const [activeTab, setActiveTab] = useState<'critical' | 'high' | 'medium' | 'low'>('critical');
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    // Redirect if no analysis data
    useEffect(() => {
        if (!analysis) {
            navigate('/upload');
        }
    }, [analysis, navigate]);

    if (!analysis) {
        return null;
    }

    const { report } = analysis;
    const categories = report.categories;

    const tabs: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    const tabCounts = {
        critical: categories.critical.length,
        high: categories.high.length,
        medium: categories.medium.length,
        low: categories.low.length
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8 animate-fade-in">
                    {/* Extension Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-2">{analysis.name}</h1>
                            <p className="text-slate-400">
                                v{analysis.version} • Analyzed {new Date(analysis.timestamp).toLocaleDateString()}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => navigate('/upload')}>
                            Analyze Another
                        </Button>
                    </div>

                    {/* Risk Level Card - Main Focus */}
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

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400">Security Score</p>
                                <ProgressBar value={report.riskScore} max={100} animated={true} />
                            </div>

                            {/* Summary */}
                            <div className="pt-4 border-t border-slate-700/50">
                                <p className="text-slate-300 text-lg">{report.summary}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Findings Tabs */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">Detailed Findings</h3>

                            {/* Tab Navigation */}
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

                            {/* Findings Display */}
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/upload')}
                        >
                            Analyze Another Extension
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => {
                                // TODO: Implement PDF download
                                alert('PDF download coming soon!');
                            }}
                        >
                            Download Report
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};