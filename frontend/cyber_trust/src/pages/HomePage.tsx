import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, Eye, BarChart3, Zap, FileCode } from 'lucide-react';
import { Button } from '../components/common/Button';
import { TerminalMockup } from '../components/TerminalMockup';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { apiClient } from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const capabilities = [
  { icon: Zap, label: 'Instant Analysis', desc: 'Results in under 5 seconds' },
  { icon: Lock, label: 'Permission Audit', desc: 'Every permission explained' },
  { icon: Eye, label: 'Code Scanning', desc: 'Detect eval(), obfuscation, risky patterns' },
  { icon: BarChart3, label: 'Trust Score', desc: '0–100 quantified risk rating' },
];

const steps = [
  {
    icon: Shield,
    title: 'Upload or Paste URL',
    desc: 'Drop a .crx file or paste a Chrome Web Store link — we handle the rest',
    accent: 'from-blue-500/20',
  },
  {
    icon: FileCode,
    title: 'Deep Static Analysis',
    desc: 'We parse manifest.json, scan code files, evaluate 23 security patterns',
    accent: 'from-amber-500/20',
  },
  {
    icon: BarChart3,
    title: 'Get Your Report',
    desc: 'Receive a Trust Score with detailed breakdown and AI-powered TLDR',
    accent: 'from-green-500/20',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ totalScans: number; uniqueExtensions: number; averageScore: number } | null>(null);

  useEffect(() => {
    apiClient.getDashboard()
      .then(data => setStats(data.stats))
      .catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-md px-3 py-1.5 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-mono text-xs text-blue-400">Security Analyzer v1.0</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl lg:text-[56px] font-bold leading-[1.1] text-white tracking-tight"
            >
              Know Before
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                You Install
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-lg text-slate-400 max-w-[520px] leading-relaxed"
            >
              Static security analysis for Chrome extensions. Upload an extension
              or paste a Web Store URL to scan permissions, detect vulnerabilities,
              and get a Trust Score — powered by AI.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex items-center gap-4"
            >
              <button
                onClick={() => navigate('/upload')}
                className="group bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                Upload & Analyze
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                See how it works ↓
              </button>
            </motion.div>
          </div>

          {/* Terminal Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block w-[460px] shrink-0 mt-2"
          >
            <TerminalMockup />
          </motion.div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-b border-slate-700/50">
          {[
            { value: stats?.totalScans || 0, label: 'Extensions Scanned', suffix: '+' },
            { value: stats?.uniqueExtensions || 0, label: 'Unique Extensions', suffix: '' },
            { value: stats?.averageScore || 0, label: 'Avg Trust Score', suffix: '' },
            { value: 23, label: 'Security Checks', suffix: '' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                className="font-mono text-2xl md:text-3xl font-bold text-white"
              />
              <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl font-bold text-white mb-8"
        >
          What Cyber-Trust Does
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-blue-600/40 transition-all duration-300"
            >
              <cap.icon size={20} className="text-slate-400 mb-3 group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
              <h3 className="font-semibold text-sm text-white mb-1">{cap.label}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-700/30">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl font-bold text-white mb-10"
        >
          How It Works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-600/30 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.accent} to-transparent`} />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-slate-700/50 flex items-center justify-center border border-slate-600/40">
                  <step.icon size={16} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-700/30"
      >
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Scan Your Extensions?
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Upload any .crx file or paste a Chrome Web Store URL and get a detailed security report in seconds.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="group bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-8 py-3 rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            Start Scanning
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.section>
    </div>
  );
};
