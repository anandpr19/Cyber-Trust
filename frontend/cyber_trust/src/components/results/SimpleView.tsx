import React from 'react';
import { AnalysisResult } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface SimpleViewProps {
    analysis: AnalysisResult;
    onSwitchToDetailed: () => void;
}

// Map raw findings to plain-English bullet points for non-technical users
function getPlainEnglishPermissions(analysis: AnalysisResult): Array<{ icon: string; text: string; severity: 'critical' | 'high' | 'medium' | 'low' }> {
    const items: Array<{ icon: string; text: string; severity: 'critical' | 'high' | 'medium' | 'low' }> = [];
    const findings = analysis.rawData?.findings || [];
    const seen = new Set<string>();

    const add = (key: string, icon: string, text: string, severity: 'critical' | 'high' | 'medium' | 'low') => {
        if (!seen.has(key)) {
            seen.add(key);
            items.push({ icon, text, severity });
        }
    };

    for (const f of findings) {
        if (f.type === 'permission') {
            const p = f.permission?.toLowerCase() || '';
            if (p === 'history') add('history', '📜', 'Can read your complete browsing history', 'high');
            else if (p === 'cookies') add('cookies', '🍪', 'Can access your login cookies and session data', 'high');
            else if (p === 'clipboardread') add('clipboard', '📋', 'Can read everything you copy to your clipboard', 'high');
            else if (p === 'clipboardwrite') add('clipboardw', '📝', 'Can modify your clipboard contents', 'medium');
            else if (p === 'camera') add('camera', '📹', 'Can access your webcam', 'critical');
            else if (p === 'microphone') add('mic', '🎤', 'Can access your microphone', 'critical');
            else if (p === 'management') add('mgmt', '⚙️', 'Can manage and control other extensions', 'critical');
            else if (p === 'webrequest') add('webreq', '🌐', 'Can monitor all your network traffic', 'high');
            else if (p === 'webrequestblocking') add('webreqb', '🚫', 'Can block and modify web requests', 'high');
            else if (p === 'tabs') add('tabs', '🔖', 'Can see what websites you have open', 'low');
            else if (p === 'geolocation') add('geo', '📍', 'Can access your physical location', 'medium');
            else if (p === 'downloads') add('dl', '📥', 'Can download files and see your download history', 'high');
            else if (p === 'proxy') add('proxy', '🔀', 'Can control your proxy settings', 'high');
            else if (p === 'privacy') add('priv', '🔐', 'Can modify your browser privacy settings', 'high');
            else if (p === 'identity') add('id', '🆔', 'Can access your identity and OAuth tokens', 'high');
            else if (p === 'bookmarks') add('bm', '🔖', 'Can read and modify your bookmarks', 'high');
            else if (p === 'debugger') add('debug', '🐛', 'Can debug and manipulate other extensions', 'critical');
            else if (p === 'notifications') add('notif', '🔔', 'Can show desktop notifications', 'medium');
            else if (p === 'storage') add('storage', '💾', 'Can store data locally on your device', 'low');
            else if (p === 'activetab') add('atab', '🔲', 'Can access the current tab when you click the icon', 'low');
        } else if (f.type === 'host-permission') {
            add('hostperm', '🌍', 'Has access to all websites — can read and modify data on any site', 'critical');
        } else if (f.type === 'content-script') {
            add('csinject', '💉', 'Can inject scripts into every website you visit', 'high');
        } else if (f.type === 'csp' && f.value === 'unsafe-eval') {
            add('csp', '⚡', 'Allows dynamic code execution — potential for hidden malicious code', 'high');
        } else if (f.type === 'sensitive-domain') {
            add('sensdomain', '🏦', 'Requests access to sensitive domains (banking, social media, etc.)', 'medium');
        } else if (f.type === 'permission-combo') {
            add('combo', '🔗', 'Uses a dangerous combination of permissions that could intercept your data', 'high');
        } else if (f.type === 'code-pattern') {
            const p = f.pattern || '';
            if (p === 'eval-usage') add('eval', '⚡', 'Uses eval() — can execute arbitrary code', 'high');
            else if (p === 'hardcoded-credentials') add('creds', '🔑', 'Contains hardcoded passwords or API keys in its code', 'critical');
        }
    }

    // Sort by severity
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    items.sort((a, b) => order[a.severity] - order[b.severity]);

    return items.slice(0, 6); // Show top 6 max
}

function getRecommendation(score: number, overallRisk: string): { text: string; color: string; bgColor: string; borderColor: string; icon: string } {
    if (overallRisk === 'CRITICAL' || score <= 10) {
        return {
            text: 'We recommend avoiding this extension',
            icon: '⛔',
            color: 'text-red-200',
            bgColor: 'bg-red-900/30',
            borderColor: 'border-red-600/40'
        };
    } else if (overallRisk === 'HIGH' || score <= 30) {
        return {
            text: 'High risk — only install if you truly trust the developer',
            icon: '🔴',
            color: 'text-orange-200',
            bgColor: 'bg-orange-900/30',
            borderColor: 'border-orange-600/40'
        };
    } else if (overallRisk === 'MEDIUM' || score <= 60) {
        return {
            text: 'Review the permissions carefully before installing',
            icon: '⚠️',
            color: 'text-amber-200',
            bgColor: 'bg-amber-900/25',
            borderColor: 'border-amber-600/40'
        };
    } else if (score <= 80) {
        return {
            text: 'Generally safe — common permissions for this type of extension',
            icon: '👍',
            color: 'text-blue-200',
            bgColor: 'bg-blue-900/20',
            borderColor: 'border-blue-600/30'
        };
    } else {
        return {
            text: 'This extension appears safe to install',
            icon: '✅',
            color: 'text-green-200',
            bgColor: 'bg-green-900/25',
            borderColor: 'border-green-600/35'
        };
    }
}

function getScoreColor(score: number): string {
    if (score >= 75) return '#22c55e'; // green
    if (score >= 50) return '#eab308'; // yellow
    if (score >= 25) return '#f97316'; // orange
    return '#ef4444'; // red
}

function getVerdictText(score: number): string {
    if (score >= 80) return 'Looks Safe';
    if (score >= 60) return 'Mostly Fine';
    if (score >= 40) return 'Use Caution';
    if (score >= 20) return 'Risky';
    return 'Dangerous';
}

const severityColors: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-amber-400',
    low: 'text-blue-400'
};

export const SimpleView: React.FC<SimpleViewProps> = ({ analysis, onSwitchToDetailed }) => {
    const { report, aiAnalysis, storeMetadata } = analysis;
    const score = report.riskScore;
    const permissions = getPlainEnglishPermissions(analysis);
    const recommendation = getRecommendation(score, report.overallRisk);
    const scoreColor = getScoreColor(score);
    const verdict = getVerdictText(score);

    // Circle progress
    const circumference = 2 * Math.PI * 54;
    const strokeDash = (score / 100) * circumference;

    return (
        <div className="space-y-6">

            {/* Trust Score Circle + Verdict */}
            <Card className="border-slate-700/50 bg-slate-800/40">
                <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
                    {/* Score Circle */}
                    <div className="relative flex-shrink-0">
                        <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
                            <circle
                                cx="60" cy="60" r="54" fill="none"
                                stroke={scoreColor}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${strokeDash} ${circumference}`}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white">{score}</span>
                            <span className="text-xs text-slate-400">/100</span>
                        </div>
                    </div>

                    {/* Verdict */}
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-3xl font-bold text-white mb-1">{verdict}</h2>
                        <p className="text-slate-400">{report.summary}</p>
                        {analysis.cached && (
                            <span className="inline-block mt-2 text-blue-400 text-xs bg-blue-500/10 px-2 py-0.5 rounded-full">
                                📦 Cached result
                            </span>
                        )}
                    </div>
                </div>
            </Card>

            {/* TLDR — AI Analysis */}
            {aiAnalysis && (
                <Card className="border-purple-600/30 bg-gradient-to-br from-purple-900/15 to-indigo-900/15">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🤖</span>
                                <h3 className="text-lg font-bold text-purple-200">TLDR</h3>
                                <span className="text-purple-500 text-xs bg-purple-500/10 px-2 py-0.5 rounded-full">AI-Powered</span>
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
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                            {aiAnalysis.summary}
                        </p>
                    </div>
                </Card>
            )}

            {/* What This Extension Can Do */}
            {permissions.length > 0 && (
                <Card className="border-slate-700/50 bg-slate-800/40">
                    <h3 className="text-lg font-bold text-white mb-4">What This Extension Can Do</h3>
                    <div className="space-y-3">
                        {permissions.map((perm, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 animate-fade-in-up"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <span className="text-xl flex-shrink-0 mt-0.5">{perm.icon}</span>
                                <div className="flex-1">
                                    <p className="text-slate-200 text-sm">{perm.text}</p>
                                </div>
                                <span className={`text-xs font-semibold uppercase ${severityColors[perm.severity]}`}>
                                    {perm.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recommendation Card */}
            <Card className={`${recommendation.borderColor} ${recommendation.bgColor}`}>
                <div className="flex items-center gap-4">
                    <span className="text-3xl">{recommendation.icon}</span>
                    <div>
                        <h3 className={`text-lg font-bold ${recommendation.color}`}>Our Recommendation</h3>
                        <p className={`${recommendation.color} opacity-90`}>{recommendation.text}</p>
                    </div>
                </div>
            </Card>

            {/* Extension Info footer */}
            {storeMetadata && (
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 pt-2">
                    {storeMetadata.author && <span>By <span className="text-slate-300">{storeMetadata.author}</span></span>}
                    {storeMetadata.rating && <span>⭐ {storeMetadata.rating}</span>}
                    {storeMetadata.users && <span>👥 {storeMetadata.users}</span>}
                    {storeMetadata.size && <span>📦 {storeMetadata.size}</span>}
                </div>
            )}

            {/* Switch to Detailed View */}
            <div className="text-center pt-4">
                <button
                    onClick={onSwitchToDetailed}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                    🔬 View Full Technical Analysis →
                </button>
            </div>
        </div>
    );
};
