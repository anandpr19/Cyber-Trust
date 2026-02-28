import React from 'react';

export const TerminalMockup: React.FC = () => {
    return (
        <div className="terminal-mockup bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg p-5 font-mono text-[13px] leading-7 select-none shadow-2xl shadow-black/20">
            {/* Window dots */}
            <div className="flex items-center gap-1.5 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-3 text-[11px] text-[#71717A]">cyber-trust scan</span>
            </div>

            <div className="text-[#71717A]">┌─ manifest.json ────────────────────────</div>
            <div className="text-[#71717A]">
                │{"  "}
                <span className="text-green-400">✓</span> Manifest v3
            </div>
            <div className="text-[#71717A]">
                │{"  "}
                <span className="text-orange-400">⚠</span> Permission: cookies
                {"          "}
                <span className="text-orange-400 font-semibold">HIGH</span>
            </div>
            <div className="text-[#71717A]">
                │{"  "}
                <span className="text-orange-400">⚠</span> Permission: webRequest
                {"       "}
                <span className="text-orange-400 font-semibold">HIGH</span>
            </div>
            <div className="text-[#71717A]">
                │{"  "}
                <span className="text-red-400">✗</span> Permission: {"<all_urls>"}
                {"   "}
                <span className="text-red-400 font-semibold">CRITICAL</span>
            </div>
            <div className="text-[#71717A]">
                │{"  "}
                <span className="text-red-400">✗</span> eval() detected in bg.js
                {"  "}
                <span className="text-red-400 font-semibold">CRITICAL</span>
            </div>
            <div className="text-[#71717A]">└────────────────────────────────────────</div>
            <div className="mt-3 text-white">
                Trust Score: <span className="text-red-400 font-bold">31</span>
                <span className="text-[#71717A]">/100</span>
                {"  "}
                <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                    ⛔ HIGH RISK
                </span>
            </div>
        </div>
    );
};
