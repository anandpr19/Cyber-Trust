import React from 'react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700/50 mt-24 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>© {year} Cyber-Trust</span>
            <span className="text-slate-700">·</span>
            <a href="https://github.com/anandpr19/Cyber-Trust" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-xs text-slate-500">
            ⚠️ This tool provides analysis only. Always exercise caution when installing extensions.
          </p>
        </div>
      </div>
    </footer>
  );
};