import React from 'react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 mt-24 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-4 font-mono tracking-widest uppercase text-[10px] text-zinc-500">
            <span>© {year} CYBER_TRUST</span>
            <span className="text-zinc-700">|</span>
            <a href="https://github.com/anandpr19/Cyber-Trust" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GITHUB_REPO</a>
          </div>
          <p className="font-mono tracking-widest uppercase text-[10px] text-zinc-600">
            WARNING: SYSTEM_ANALYSIS_ONLY. EXERCISE_CAUTION_UPON_INSTALL.
          </p>
        </div>
      </div>
    </footer>
  );
};