import React, { useState } from 'react';
import { Card } from '../common/Card';

interface ManifestViewerProps {
    manifest: Record<string, unknown>;
}

export const ManifestViewer: React.FC<ManifestViewerProps> = ({ manifest }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const manifestJson = JSON.stringify(manifest, null, 2);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(manifestJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = manifestJson;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card className="border-slate-700/50 bg-slate-800/40">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-left flex-1"
                >
                    <span className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                    </span>
                    <span className="text-lg">📜</span>
                    <h3 className="text-lg font-bold text-white">Raw Manifest</h3>
                    <span className="text-slate-500 text-xs">manifest.json</span>
                </button>
                {isExpanded && (
                    <button
                        onClick={handleCopy}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    >
                        {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="mt-4 overflow-x-auto">
                    <pre className="text-sm text-slate-300 bg-slate-900/60 rounded-xl p-4 border border-slate-700/40 leading-relaxed font-mono max-h-96 overflow-y-auto">
                        {manifestJson}
                    </pre>
                </div>
            )}
        </Card>
    );
};
