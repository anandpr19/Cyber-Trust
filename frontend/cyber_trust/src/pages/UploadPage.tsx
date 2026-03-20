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
        <div className="min-h-screen pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    {/* Header */}
                    <div className="animate-fade-in">
                        <h1 className="text-4xl font-display font-bold tracking-tight text-zinc-100 mb-2">Analyze_Extension</h1>
                        <p className="text-sm font-mono tracking-widest uppercase text-zinc-500 mb-8">
                            Input Web Store URL or upload .CRX
                        </p>

                        {/* Tab Switcher */}
                        <div className="flex bg-zinc-900/40 p-1 mb-8 border border-white/5 shadow-sm rounded">
                            <button
                                onClick={() => setActiveTab('url')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-[11px] font-mono tracking-widest uppercase transition-all duration-300 rounded-sm ${activeTab === 'url'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                    }`}
                            >
                                <span>URL_INPUT</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-[11px] font-mono tracking-widest uppercase transition-all duration-300 rounded-sm ${activeTab === 'upload'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                    }`}
                            >
                                <span>CRX_UPLOAD</span>
                            </button>
                        </div>

                        {/* URL/ID Input Tab */}
                        {activeTab === 'url' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-blue-500 font-mono text-sm">{'>'}</span>
                                    </div>
                                    <input
                                        id="url-input"
                                        type="text"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        onKeyDown={handleUrlKeyDown}
                                        placeholder="Paste Chrome Web Store URL or ID [e.g. aapbdbdomjkkjkaonfhkkikfgjllcleb]"
                                        disabled={isLoading}
                                        className="w-full pl-10 pr-4 py-4 bg-zinc-900/60 border border-white/10 rounded-none text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:bg-black/40 transition-all font-mono text-xs disabled:opacity-50 shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        isLoading={isLoading}
                                        disabled={isLoading || !urlInput.trim()}
                                        onClick={handleUrlScan}
                                        className="flex-1 rounded-sm font-mono tracking-widest uppercase text-[11px]"
                                    >
                                        {isLoading ? 'ANALYZING...' : 'EXECUTE_ANALYSIS'}
                                    </Button>
                                </div>

                                {isLoading && (
                                    <div className="flex items-center gap-4 p-4 mt-6 bg-black/40 border-l-2 border-l-blue-500 border border-white/5 shadow-sm rounded-r-sm">
                                        <LoadingSpinner size="sm" color="text-blue-500" />
                                        <div>
                                            <p className="font-mono text-sm text-blue-400">ANALYSIS_IN_PROGRESS</p>
                                            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Downloading & Scanning heuristics...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Example URLs */}
                                <div className="mt-8 p-4 bg-zinc-900/40 border border-white/5 rounded-sm">
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3 border-b border-white/5 pb-2">Example_Targets:</p>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Google Translate', id: 'aapbdbdomjkkjkaonfhkkikfgjllcleb' },
                                            { label: 'React DevTools', id: 'fmkadmapgofadopljbjfkapdkoienihi' },
                                            { label: 'Full URL', id: 'https://chromewebstore.google.com/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb' },
                                        ].map((example) => (
                                            <button
                                                key={example.id}
                                                onClick={() => setUrlInput(example.id)}
                                                className="block w-full text-left font-mono text-[11px] text-zinc-400 hover:text-blue-400 transition-colors truncate"
                                            >
                                                <span className="text-zinc-600">[{example.label}] </span>
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
                                className={`border border-dashed p-12 text-center transition-all duration-300 bg-zinc-900/40 rounded-sm ${isDragging
                                        ? 'border-blue-500 bg-blue-500/5'
                                        : 'border-white/10 hover:border-white/20'
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
                                        <LoadingSpinner size="md" color="text-blue-500" />
                                        <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-400">ANALYZING_PAYLOAD...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="text-3xl text-zinc-600 animate-pulse font-mono">{'{ ... }'}</div>
                                        <div>
                                            <p className="font-display text-lg tracking-tight font-semibold text-zinc-100 mb-1">DRAG & DROP .CRX BUNDLE</p>
                                            <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-500">OR CLICK TO BROWSE FILESYSTEM</p>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-sm font-mono tracking-widest uppercase text-[10px]"
                                        >
                                            SELECT_FILE
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="border border-white/5 border-l-2 border-l-red-500 bg-black/40 shadow-sm rounded p-4">
                            <div className="flex gap-3 items-center">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <h3 className="font-mono text-xsup text-red-400 uppercase tracking-widest text-[10px]">Analysis_Failed</h3>
                                    <p className="font-mono text-zinc-500 text-[10px] mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Analyses */}
                    {analyses.length > 0 && (
                        <div className="space-y-4 animate-fade-in border-t border-white/5 pt-8">
                            <h2 className="text-xl font-display font-bold tracking-tight text-zinc-100">LOCAL_CACHE</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analyses.slice(0, 4).map((analysis) => (
                                    <div
                                        key={analysis.id}
                                        className="bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all duration-300 p-4 rounded shadow-sm cursor-pointer group"
                                        onClick={() => navigate('/results', { state: { analysis: analysis.result } })}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-zinc-200 text-sm group-hover:text-blue-400 transition-colors">{analysis.result.name}</h3>
                                                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">v{analysis.result.version}</p>
                                                <p className="font-mono text-[10px] text-zinc-600 mt-2">
                                                    {new Date(analysis.savedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-display font-bold tracking-tight text-blue-500">
                                                    {analysis.result.report.riskScore}
                                                </p>
                                                <p className="font-mono text-[10px] text-zinc-500">/100</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info Card */}
                    <div className="border border-white/5 border-l-2 border-l-blue-500 bg-black/40 shadow-sm p-4 rounded mt-12">
                        <div className="flex gap-4">
                            <span className="text-xl opacity-80">ℹ️</span>
                            <div>
                                <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-2">Operation_Manual</h3>
                                <p className="font-mono text-zinc-400 text-xs mt-2 leading-relaxed">
                                    <strong className="text-zinc-300">URL INGEST:</strong> Input Chrome Web Store URL or ID. The system autonomously retrieves the extension, inspects manifest heuristics, and synthesizes an AI threat report.
                                </p>
                                <p className="font-mono text-zinc-400 text-xs mt-3 leading-relaxed">
                                    <strong className="text-zinc-300">LOCAL PAYLOAD:</strong> If processing an offline package, utilize the CRX_UPLOAD module to parse a local binary.
                                </p>
                            </div>
                        </div>
                    </div>
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