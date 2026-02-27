import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Moon, Sun, Github } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/upload', label: 'Analyze' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-300">
              <Shield size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-base tracking-tight">Cyber-Trust</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'text-white bg-slate-800'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="w-px h-5 bg-slate-700/50 mx-2" />

            <a
              href="https://github.com/anandpr19/Cyber-Trust"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-800/50"
              title="GitHub"
            >
              <Github size={16} />
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-800/50"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};