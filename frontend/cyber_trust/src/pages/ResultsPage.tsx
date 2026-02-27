import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AnalysisResult } from '../types';
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

    useEffect(() => {
        if (!analysis) {
            navigate('/upload');
        }
    }, [analysis, navigate]);

    const switchView = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem(VIEW_MODE_KEY, mode);
    };

    if (!analysis) {
        return null;
    }

    const { storeMetadata } = analysis;
    const date = new Date(analysis.timestamp || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <div className="space-y-6">

                    {/* Extension Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            {storeMetadata?.icon && (
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    src={storeMetadata.icon}
                                    alt={storeMetadata?.name || 'Extension'}
                                    className="w-16 h-16 rounded-xl shadow-lg"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-white truncate">
                                        {storeMetadata?.name || analysis.name || 'Extension'}
                                    </h1>
                                    {analysis.version && (
                                        <span className="font-mono text-sm text-slate-400">
                                            v{analysis.version}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[13px] text-slate-500 mt-1">
                                    Analyzed on {date}
                                    {storeMetadata?.author && ` · by ${storeMetadata.author}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* View Toggle — tab style */}
                    <div className="flex gap-6 border-b border-slate-700/50">
                        {(['simple', 'detailed'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => switchView(v)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${viewMode === v
                                    ? 'text-white border-white'
                                    : 'text-slate-400 border-transparent hover:text-white'
                                    }`}
                            >
                                {v === 'simple' ? 'Summary' : 'Technical Details'}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <motion.div
                        key={viewMode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {viewMode === 'simple' ? (
                            <SimpleView analysis={analysis} onSwitchToDetailed={() => switchView('detailed')} />
                        ) : (
                            <DetailedView analysis={analysis} onSwitchToSimple={() => switchView('simple')} />
                        )}
                    </motion.div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-4 pt-8 border-t border-slate-700/50">
                        <button
                            onClick={() => navigate('/upload')}
                            className="border border-slate-700/50 text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Analyze Another Extension
                        </button>
                        {storeMetadata?.storeUrl && (
                            <a
                                href={storeMetadata.storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                View in Chrome Web Store
                                <ArrowRight size={14} />
                            </a>
                        )}
                    </div>

                </div>
            </motion.div>
        </div>
    );
};