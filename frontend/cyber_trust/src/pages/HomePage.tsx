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
      .then(data => {
        if (data?.stats) setStats(data.stats);
      })
      .catch((err) => {
        console.warn('Homepage stats unavailable:', err.message);
      });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-black/40 border border-white/5 rounded px-3 py-1 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-none bg-blue-500 animate-pulse border border-white/10" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Security Analyzer v1.0</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl lg:text-7xl font-display font-bold leading-[1.05] text-zinc-100 tracking-tight"
            >
              Know Before
              <br />
              <span className="text-blue-500">
                You Install
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-sm font-mono text-zinc-400 max-w-[520px] leading-relaxed uppercase tracking-widest"
            >
              Static security analysis for Chrome extensions. Upload a payload
              or input a Web Store URL to scan permissions, detect vulnerabilities,
              and retrieve a Trust Score — powered by AI.
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
                className="group bg-blue-600 hover:bg-blue-500 text-white font-mono tracking-widest text-[11px] uppercase px-6 py-3 rounded-sm transition-all flex items-center gap-2"
              >
                EXECUTE_ANALYSIS
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[11px] font-mono tracking-widest uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                VIEW_DOCUMENTATION ↓
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-b border-white/5">
          {(stats ? [
            { value: stats.totalScans, label: 'Extensions Scanned', suffix: '+' },
            { value: stats.uniqueExtensions, label: 'Unique Extensions', suffix: '' },
            { value: stats.averageScore, label: 'Avg Trust Score', suffix: '' },
            { value: 23, label: 'Security Checks', suffix: '' },
          ] : [
            { value: 23, label: 'Security Checks', suffix: '' },
            { value: 7, label: 'Risk Categories', suffix: '' },
            { value: 100, label: 'Max Trust Score', suffix: '' },
            { value: 5, label: 'Seconds to Scan', suffix: 's' },
          ]).map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                className="font-display tracking-tight text-3xl md:text-5xl font-bold text-zinc-100"
              />
              <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase mt-2">{stat.label}</p>
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
          className="text-xl font-display font-bold tracking-tight text-zinc-100 mb-8 border-b border-white/5 pb-2"
        >
          CAPABILITIES
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
              className="group bg-zinc-900/40 border border-white/5 shadow-sm rounded-sm p-5 hover:border-white/10 transition-all duration-300"
            >
              <cap.icon size={20} className="text-zinc-500 mb-4 group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
              <h3 className="font-mono tracking-widest text-[10px] uppercase font-bold text-zinc-300 mb-2">{cap.label}</h3>
              <p className="text-[11px] font-mono text-zinc-500 leading-relaxed uppercase">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl font-display font-bold tracking-tight text-zinc-100 mb-10 border-b border-white/5 pb-2 cursor-text"
        >
          EXECUTION_FLOW
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
              className="relative bg-zinc-900/40 border border-white/5 shadow-sm rounded-sm p-6 hover:border-white/10 transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-sm bg-black/40 flex items-center justify-center border border-white/5">
                  <step.icon size={16} className="text-zinc-500" strokeWidth={1.5} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 bg-black/20 px-2 py-0.5 rounded border border-white/5 ">STEP_0{i + 1}</span>
              </div>
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-zinc-300 mb-2">{step.title}</h3>
              <p className="text-xs font-mono text-zinc-500 leading-relaxed uppercase">{step.desc}</p>
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5"
      >
        <div className="bg-zinc-900/40 border border-white/5 shadow-sm rounded-sm p-10 text-center">
          <h2 className="text-2xl font-display font-bold tracking-tight text-zinc-100 mb-3">
            INITIATE_ANALYSIS
          </h2>
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">
            Upload payload or input Web Store locator. Detailed security heuristic report synthesized autonomously.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="group bg-blue-600 hover:bg-blue-500 text-white font-mono tracking-widest text-[11px] uppercase px-8 py-3 rounded-sm transition-all inline-flex items-center gap-2"
          >
            START_SCANNING
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.section>
    </div>
  );
};
