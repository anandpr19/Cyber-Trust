import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Toast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

type TabMode = 'upload' | 'url';

export const UploadPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const hasNavigatedRef = useRef(false);
    const [activeTab, setActiveTab] = useState<TabMode>('url');
    const [urlInput, setUrlInput] = useState('');

    const { result, isLoading, error, uploadFile, scanById } = useAnalysis();
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
            setToast({ message: 'Failed to analyze extension', type: 'error' });
        }
    };

    // Handle URL/ID scan
    const handleUrlScan = async () => {
        const input = urlInput.trim();
        if (!input) {
            setToast({ message: 'Please enter a Chrome Web Store URL or Extension ID', type: 'error' });
            return;
        }

        try {
            await scanById(input);
        } catch {
            setToast({ message: 'Failed to scan extension', type: 'error' });
        }
    };

    // Handle Enter key in URL input
    const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleUrlScan();
        }
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) {
            setIsDragging(true);
        }
    };

    // Handle drag leave
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!isLoading && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input value after file is selected
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Navigate to results when analysis is complete
    useEffect(() => {
        if (result && !hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            saveAnalysis(result);
            navigate('/results', { state: { analysis: result } });
        }
    }, [result, navigate, saveAnalysis]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    {/* Header */}
                    <div className="animate-fade-in">
                        <h1 className="text-4xl font-bold text-white mb-2">Analyze Your Extension</h1>
                        <p className="text-slate-400 mb-8">
                            Enter a Chrome Web Store URL or upload a .crx file to get instant security analysis
                        </p>

                        {/* Tab Switcher */}
                        <div className="flex rounded-xl bg-slate-800/60 p-1.5 mb-6 border border-slate-700/50">
                            <button
                                onClick={() => setActiveTab('url')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'url'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                    }`}
                            >
                                <span>🔗</span>
                                <span>URL / Extension ID</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'upload'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                    }`}
                            >
                                <span>📦</span>
                                <span>Upload .crx File</span>
                            </button>
                        </div>

                        {/* URL/ID Input Tab */}
                        {activeTab === 'url' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-lg">🔍</span>
                                    </div>
                                    <input
                                        id="url-input"
                                        type="text"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        onKeyDown={handleUrlKeyDown}
                                        placeholder="Paste Chrome Web Store URL or Extension ID (e.g. aapbdbdomjkkjkaonfhkkikfgjllcleb)"
                                        disabled={isLoading}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border-2 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-base disabled:opacity-50"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        isLoading={isLoading}
                                        disabled={isLoading || !urlInput.trim()}
                                        onClick={handleUrlScan}
                                        className="flex-1"
                                    >
                                        {isLoading ? 'Analyzing...' : '🛡️ Analyze Extension'}
                                    </Button>
                                </div>

                                {isLoading && (
                                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                        <LoadingSpinner size="md" color="text-blue-500" />
                                        <div>
                                            <p className="text-slate-200 font-medium">Analyzing extension...</p>
                                            <p className="text-slate-400 text-sm">Downloading, scanning, and generating AI report</p>
                                        </div>
                                    </div>
                                )}

                                {/* Example URLs */}
                                <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                                    <p className="text-slate-400 text-xs font-medium mb-2">EXAMPLES — click to try:</p>
                                    <div className="space-y-1.5">
                                        {[
                                            { label: 'Google Translate', id: 'aapbdbdomjkkjkaonfhkkikfgjllcleb' },
                                            { label: 'React DevTools', id: 'fmkadmapgofadopljbjfkapdkoienihi' },
                                            { label: 'Full URL', id: 'https://chromewebstore.google.com/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb' },
                                        ].map((example) => (
                                            <button
                                                key={example.id}
                                                onClick={() => setUrlInput(example.id)}
                                                className="block w-full text-left text-xs text-blue-400 hover:text-blue-300 transition-colors truncate"
                                            >
                                                <span className="text-slate-500">{example.label}: </span>
                                                {example.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File Upload Tab */}
                        {activeTab === 'upload' && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging
                                        ? 'border-blue-500 bg-blue-500/10 scale-105'
                                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                                    } ${isLoading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
                            >
                                {/* Hidden File Input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".crx"
                                    onChange={handleInputChange}
                                    className="hidden"
                                    disabled={isLoading}
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
                        )}
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
                                <h3 className="font-semibold text-blue-200">How it works</h3>
                                <p className="text-blue-300 text-sm mt-2">
                                    <strong>URL/ID method:</strong> Paste a Chrome Web Store URL or extension ID. We'll automatically
                                    download the extension, analyze its permissions, scan its code, and generate an AI-powered
                                    security report.
                                </p>
                                <p className="text-blue-300 text-sm mt-2">
                                    <strong>File upload:</strong> If you have a .crx file, switch to the upload tab and drag-drop
                                    it for analysis.
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