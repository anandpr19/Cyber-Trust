import React from 'react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900/50 border-t border-slate-700/50 mt-24 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white mb-4">Cyber-Trust</h3>
            <p className="text-slate-400 text-sm">
              A security analysis tool for Chrome extensions to help you make informed decisions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report Issue</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {year} Cyber-Trust. Built for security-conscious users.</p>
          <p className="mt-2">
            ⚠️ <span className="text-slate-300">Disclaimer:</span> This tool provides analysis only. Always exercise caution when installing extensions.
          </p>
        </div>
      </div>
    </footer>
  );
};