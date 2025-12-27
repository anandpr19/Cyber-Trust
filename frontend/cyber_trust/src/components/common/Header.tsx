import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-300">
              <span className="text-white font-bold text-lg">🔒</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg">Cyber-Trust</span>
              <span className="text-xs text-slate-400">Security Analyzer</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link to="/upload" className="text-slate-300 hover:text-white transition-colors">Analyze</Link>
            <a
              href="https://github.com/anandpr19/Cyber-Trust"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};