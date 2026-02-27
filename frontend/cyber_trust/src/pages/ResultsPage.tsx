import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnalysisResult } from '../types';
import { Button } from '../components/common/Button';
import { SimpleView } from '../components/results/SimpleView';
import { DetailedView } from '../components/results/DetailedView';

type ViewMode = 'simple' | 'detailed';

const VIEW_MODE_KEY = 'cyber-trust-view-mode';

export const ResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const analysis = location.state?.analysis as AnalysisResult | undefined;

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        return (saved === 'detailed' ? 'detailed' : 'simple') as ViewMode;
    });

    // Redirect if no analysis data
    useEffect(() => {
        if (!analysis) {
            navigate('/upload');
        }
    }, [analysis, navigate]);

    // Persist view mode
    const switchView = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem(VIEW_MODE_KEY, mode);
    };

    if (!analysis) {
        return null;
    }

    const { storeMetadata } = analysis;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-6 animate-fade-in">

                    {/* Extension Header — shared between both views */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            {storeMetadata?.icon && (
                                <img
                                    src={storeMetadata.icon}
                                    alt={analysis.name}
                                    className="w-14 h-14 rounded-xl shadow-lg border border-slate-700/50"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-white">{analysis.name}</h1>
                                <p className="text-slate-400 text-sm">
                                    v{analysis.version} • Analyzed {new Date(analysis.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => navigate('/upload')}>
                            Analyze Another
                        </Button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center justify-center">
                        <div className="flex rounded-xl bg-slate-800/70 p-1 border border-slate-700/50">
                            <button
                                onClick={() => switchView('simple')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === 'simple'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                🛡️ Simple View
                            </button>
                            <button
                                onClick={() => switchView('detailed')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === 'detailed'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                🔬 Stats for Nerds
                            </button>
                        </div>
                    </div>

                    {/* View Content */}
                    {viewMode === 'simple' ? (
                        <SimpleView
                            analysis={analysis}
                            onSwitchToDetailed={() => switchView('detailed')}
                        />
                    ) : (
                        <DetailedView
                            analysis={analysis}
                            onSwitchToSimple={() => switchView('simple')}
                        />
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        <Button variant="primary" size="lg" onClick={() => navigate('/upload')}>
                            Analyze Another Extension
                        </Button>
                        {storeMetadata?.storeUrl && (
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => window.open(storeMetadata.storeUrl, '_blank')}
                            >
                                View in Web Store
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};