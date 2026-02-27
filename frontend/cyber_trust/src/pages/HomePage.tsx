import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { apiClient } from '../services/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ totalScans: number; uniqueExtensions: number } | null>(null);

  useEffect(() => {
    apiClient.getDashboard()
      .then(data => setStats(data.stats))
      .catch(() => { }); // Fail silently — stats are non-critical
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Is Your Extension
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Safe to Install?
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Get instant security analysis of Chrome extensions. Understand permissions, identify risks, and make confident installation decisions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              onClick={() => navigate('/upload')}
              variant="primary"
              size="lg"
              className="animate-pulse-glow"
            >
              ↑ Upload & Analyze
            </Button>
            <Button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="secondary"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Animated Illustration */}
        <div className="mt-16 relative h-64 md:h-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-2xl" />
          <div className="relative text-8xl animate-float">🔒</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Use Cyber-Trust?</h2>
          <p className="text-slate-400 text-lg">
            Know before you install. Stay secure, stay informed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800 hover:border-blue-600/50 transition-all duration-300 hover:-translate-y-1 cursor-default animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Credibility — Real Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Trusted by Security-Conscious Users</h2>
          <p className="text-slate-400 mb-8">
            Analyze extensions with confidence. Our deep static analysis detects permissions, code patterns, and potential security risks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {stats ? `${stats.totalScans}+` : '—'}
              </p>
              <p className="text-slate-400">Extensions Analyzed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">23</p>
              <p className="text-slate-400">Security Checks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">Instant</p>
              <p className="text-slate-400">Results</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-8">Ready to check an extension?</h2>
        <Button
          onClick={() => navigate('/upload')}
          variant="primary"
          size="lg"
          className="animate-bounce-subtle"
        >
          Start Analyzing Now
        </Button>
      </section>
    </div>
  );
};

const features = [
  {
    icon: '📋',
    title: 'Permission Analysis',
    description: 'See exactly what data each extension can access'
  },
  {
    icon: '⚠️',
    title: 'Risk Detection',
    description: 'Identify code patterns and security vulnerabilities'
  },
  {
    icon: '📊',
    title: 'Trust Score',
    description: 'Get a clear security rating from 0-100'
  },
  {
    icon: '✨',
    title: 'Easy to Understand',
    description: 'No tech jargon, just clear explanations'
  }
];
