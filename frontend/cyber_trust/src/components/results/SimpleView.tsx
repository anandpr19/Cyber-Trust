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
            color: 'text-red-400',
            bgColor: 'bg-zinc-900/40',
            borderColor: 'border-red-500/20 border-l-2 border-l-red-500'
        };
    } else if (overallRisk === 'HIGH' || score <= 30) {
        return {
            text: 'High risk — only install if you truly trust the developer',
            icon: '🔴',
            color: 'text-orange-400',
            bgColor: 'bg-zinc-900/40',
            borderColor: 'border-orange-500/20 border-l-2 border-l-orange-500'
        };
    } else if (overallRisk === 'MEDIUM' || score <= 60) {
        return {
            text: 'Review the permissions carefully before installing',
            icon: '⚠️',
            color: 'text-amber-400',
            bgColor: 'bg-zinc-900/40',
            borderColor: 'border-amber-500/20 border-l-2 border-l-amber-500'
        };
    } else if (score <= 80) {
        return {
            text: 'Generally safe — common permissions for this type of extension',
            icon: '✅',
            color: 'text-zinc-300',
            bgColor: 'bg-zinc-900/40',
            borderColor: 'border-white/5 border-l-2 border-l-zinc-500'
        };
    } else {
        return {
            text: 'This extension appears safe to install',
            icon: '✅',
            color: 'text-zinc-300',
            bgColor: 'bg-zinc-900/40',
            borderColor: 'border-white/5 border-l-2 border-l-green-500'
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
            <Card className="border border-white/5 bg-zinc-900/40 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-10 py-6 px-4">
                    {/* Score Circle */}
                    <div className="relative flex-shrink-0">
                        <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#27272a" strokeWidth="6" />
                            <circle
                                cx="60" cy="60" r="54" fill="none"
                                stroke={scoreColor}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${strokeDash} ${circumference}`}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-display tracking-tight font-bold text-zinc-100">{score}</span>
                            <span className="text-xs font-mono text-zinc-500">/100</span>
                        </div>
                    </div>

                    {/* Verdict */}
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-4xl font-display tracking-tight font-bold text-zinc-100 mb-2">{verdict}</h2>
                        <p className="text-zinc-400 font-medium">{report.summary}</p>
                        
                        <p className="text-xs text-zinc-500 font-mono mt-4 border-l border-zinc-700 pl-3 py-1">
                            {'>'} WARNING: Score reflects static patterns, not runtime behavior.
                        </p>

                        {analysis.cached && (
                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-800/50 border border-white/5 px-2 py-1 rounded">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                    Cached
                                </span>
                            </div>
                        )}
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
                        
                        <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                            {aiAnalysis.summary.split('\n').map((line, idx) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;
                                
                                // Parse out bold headers if the LLM includes them
                                const isHeader = trimmed.endsWith(':') || trimmed.includes('Risk Level:');
                                
                                return (
                                    <p key={idx} className={`${isHeader ? 'font-semibold text-slate-200 mt-4' : 'text-slate-400'} flex gap-2`}>
                                        {trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed) ? (
                                            <span className="text-purple-500 mt-0.5">•</span>
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

            {/* What This Extension Can Do */}
            {permissions.length > 0 && (
                <Card className="border border-white/5 bg-zinc-900/40 shadow-xl">
                    <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-400 mb-6 border-b border-white/5 pb-3">Detected_Permissions</h3>
                    <div className="space-y-4">
                        {permissions.map((perm, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 animate-fade-in-up group"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <span className="text-xl flex-shrink-0 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-lg">{perm.icon}</span>
                                <div className="flex-1">
                                    <p className="text-zinc-300 text-sm font-medium">{perm.text}</p>
                                </div>
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded bg-zinc-800/80 border border-white/5 ${severityColors[perm.severity]}`}>
                                    {perm.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recommendation Card */}
            <Card className={`border border-white/5 shadow-inner ${recommendation.bgColor}`}>
                <div className="flex items-center gap-5 relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${recommendation.borderColor.split(' ').find(c => c.startsWith('border-l-'))?.replace('border-l-', 'bg-')} rounded-l-md`}></div>
                    <span className="text-3xl pl-3">{recommendation.icon}</span>
                    <div>
                        <h3 className={`text-sm font-mono tracking-widest uppercase mb-1 ${recommendation.color}`}>System_Recommendation</h3>
                        <p className="text-zinc-200 font-medium text-lg tracking-tight">{recommendation.text}</p>
                    </div>
                </div>
            </Card>

            {/* Extension Info footer */}
            {storeMetadata && (
                <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-mono text-zinc-500 pt-4 pb-2 border-t border-white/5">
                    {storeMetadata.author && <span>AUTHOR: <span className="text-zinc-300">{storeMetadata.author}</span></span>}
                    {storeMetadata.rating && <span>RATING: <span className="text-zinc-300">{storeMetadata.rating}</span></span>}
                    {storeMetadata.users && <span>USERS: <span className="text-zinc-300">{storeMetadata.users}</span></span>}
                    {storeMetadata.size && <span>SIZE: <span className="text-zinc-300">{storeMetadata.size}</span></span>}
                </div>
            )}

            {/* Switch to Detailed View */}
            <div className="text-center pt-2">
                <button
                    onClick={onSwitchToDetailed}
                    className="text-blue-500 hover:text-blue-400 font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2 px-4 py-2 rounded border border-transparent hover:border-blue-500/30 hover:bg-blue-500/10"
                >
                    {'>'} View_Detailed_Logs
                </button>
            </div>
        </div>
    );
};
