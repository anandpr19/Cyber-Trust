import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Toast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const UploadPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { result, isLoading, error, uploadFile } = useAnalysis();
    const { analyses, saveAnalysis } = useLocalStorage();

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        if (!file.name.endsWith('.crx')) {
            setToast({ message: 'Please upload a .crx file', type: 'error' });
            return;
        }

        try {
            await uploadFile(file);
        } catch {
            // Don't need the error object, just show message
            setToast({ message: 'Failed to analyze extension', type: 'error' });
        }
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // Navigate to results when analysis is complete
    React.useEffect(() => {
        if (result) {
            saveAnalysis(result);
            navigate('/results', { state: { analysis: result } });
        }
    }, [result, navigate, saveAnalysis]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    {/* Upload Area */}
                    <div className="animate-fade-in">
                        <h1 className="text-4xl font-bold text-white mb-2">Analyze Your Extension</h1>
                        <p className="text-slate-400 mb-8">
                            Upload a .crx file to get instant security analysis
                        </p>

                        {/* Upload Box */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${isDragging
                                    ? 'border-blue-500 bg-blue-500/10 scale-105'
                                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".crx"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleFileSelect(e.target.files[0]);
                                    }
                                }}
                                className="hidden"
                            />

                            {isLoading ? (
                                <div className="space-y-4">
                                    <LoadingSpinner size="lg" color="text-blue-500" />
                                    <p className="text-slate-300">Analyzing extension...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-6xl animate-float">📦</div>
                                    <div>
                                        <p className="text-lg font-semibold text-white">Drag & drop your .crx file here</p>
                                        <p className="text-slate-400">or click to browse</p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="md"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Select File
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Card className="border-red-600/50 bg-red-900/20">
                            <div className="flex gap-3">
                                <span className="text-2xl">❌</span>
                                <div>
                                    <h3 className="font-semibold text-red-200">Analysis Failed</h3>
                                    <p className="text-red-300 text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Recent Analyses */}
                    {analyses.length > 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-2xl font-bold text-white">Recent Analyses</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analyses.slice(0, 4).map((analysis) => (
                                    <Card
                                        key={analysis.id}
                                        hover
                                        onClick={() => navigate('/results', { state: { analysis: analysis.result } })}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{analysis.result.name}</h3>
                                                <p className="text-sm text-slate-400">v{analysis.result.version}</p>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {new Date(analysis.savedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-400">
                                                    {analysis.result.report.riskScore}
                                                </p>
                                                <p className="text-xs text-slate-400">/100</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info Card */}
                    <Card className="border-blue-600/30 bg-blue-900/20">
                        <div className="flex gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <div>
                                <h3 className="font-semibold text-blue-200">How to get a .crx file</h3>
                                <p className="text-blue-300 text-sm mt-2">
                                    Use the CRXExtractor extension from the Chrome Web Store to download .crx files from Chrome extension pages.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};