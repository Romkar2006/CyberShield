import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Typed from 'typed.js';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, FileText, Globe as GlobeIcon, Languages, Brain, Mail, Activity, Lock, Database, ShieldCheck } from 'lucide-react';
import { BnsTerminal } from '../components/shared/BnsTerminal';
import { isUserLoggedIn } from '../lib/auth';
import { useAuthModal } from '../components/layout/AuthContext';

const LiveIntelligenceMatrix = () => {
  const nodes = [
    {
      id: 'analytics',
      title: "Real-time Intelligence",
      desc: "Instant classification via Zephyr 7B neural network.",
      icon: Activity,
      color: "text-cyan",
      bg: "bg-cyan/5",
      border: "border-cyan/20",
      glow: "shadow-[0_0_50px_rgba(34,211,238,0.1)]"
    },
    {
      id: 'bns',
      title: "Legal Mapping Engine",
      desc: "Automated BNS 2024 compliance & court-admissible output.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      glow: "shadow-[0_0_50px_rgba(16,185,129,0.1)]"
    },
    {
      id: 'entity',
      title: "Graph Correlation",
      desc: "Deep-link analysis for UPI, Phone, and Bank ID clustering.",
      icon: Database,
      color: "text-indigo-500",
      bg: "bg-indigo-500/5",
      border: "border-indigo-500/20",
      glow: "shadow-[0_0_50px_rgba(99,102,241,0.1)]"
    }
  ];

  return (
    <div className="relative w-full mt-20">
      {/* Immersive Neural Connections (SVG) */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <svg className="w-full h-full opacity-20">
          <motion.path
            d="M 200 150 Q 640 50 1080 150"
            fill="none"
            stroke="url(#gradient-line)"
            strokeWidth="1.5"
            strokeDasharray="10 5"
            animate={{ strokeDashoffset: [100, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#fff" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`group relative p-8 rounded-3xl bg-white/40 dark:bg-[#0D1526]/60 backdrop-blur-2xl border ${node.border} ${node.glow} transition-all duration-500`}
          >
            <div className={`w-14 h-14 rounded-2xl ${node.bg} border ${node.border} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500`}>
              <node.icon className={`w-7 h-7 ${node.color} animate-pulse`} />
            </div>

            <h3 className="text-2xl font-black tracking-tight text-light-text-primary dark:text-dark-text-primary mb-3">
              {node.title}
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed font-medium">
              {node.desc}
            </p>

            {/* Corner Decorative Element */}
            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${node.color} opacity-20 animate-ping`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const Landing = () => {
  const { showAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const typedRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "> Monitoring cyber threats...",
        "> AI classification active...",
        "> Fraud patterns detected...",
        "> BNS 2024 sections mapped...",
        "> System online..."
      ],
      typeSpeed: 40,
      backSpeed: 20,
      backDelay: 1500,
      loop: true,
      cursorChar: '|'
    });

    return () => typed.destroy();
  }, []);

  return (
    <div className="w-full min-h-screen bg-transparent font-['Inter',sans-serif] text-light-text-primary dark:text-dark-text-primary overflow-x-hidden selection:bg-cyan selection:text-light-text-inverse flex flex-col items-center transition-colors duration-300">
      <div className="w-full flex-1 flex flex-col items-center">
        {/* SECTION 1 — HERO */}
        <section className="min-h-[calc(100vh-64px)] w-full max-w-[1280px] px-8 flex items-center py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            {/* LEFT HALF */}
            <div className="flex flex-col items-start z-10 w-full pt-8 lg:pt-0">
              <div className="bg-cyan/10 border border-cyan dark:border-cyan-dark text-cyan dark:text-cyan-dark rounded-full px-3 py-1 text-xs tracking-widest uppercase mb-6 font-semibold">
                AI-POWERED · BNS 2024
              </div>
              <h1 className="text-5xl font-bold tracking-tight leading-tight text-light-text-primary dark:text-dark-text-primary m-0 p-0 break-words">
                AI-Powered Cybercrime<br />
                <span className="text-cyan dark:text-cyan-dark">Protection for Every Indian</span>
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg mt-4 max-w-md leading-relaxed font-medium">
                File complaints in Hindi, Hinglish, or English. Get your FIR in 15 seconds.
              </p>

              <div className="bg-light-bg-surface dark:bg-dark-bg-surface border border-light-border-default dark:border-dark-border-default shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,212,255,0.05)] rounded-lg p-4 mt-6 max-w-md w-full">
                <span ref={typedRef} className="text-cyan dark:text-cyan-dark text-sm font-mono tracking-tight"></span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                {isUserLoggedIn() ? (
                  <Link to="/complaint" className="bg-cyan dark:bg-cyan-dark text-light-text-inverse dark:text-dark-text-inverse px-8 py-3 rounded-lg font-bold hover:brightness-110 shadow-[0_4px_14px_0_rgb(0,212,255,0.39)] dark:shadow-[0_0_24px_rgba(0,212,255,0.4)] transition-all flex items-center gap-2 whitespace-nowrap lg:text-base">
                    File a Complaint →
                  </Link>
                ) : (
                  <button
                    onClick={showAuthModal}
                    className="bg-cyan dark:bg-cyan-dark text-light-text-inverse dark:text-dark-text-inverse px-8 py-3 rounded-lg font-bold hover:brightness-110 shadow-[0_4px_14px_0_rgb(0,212,255,0.39)] dark:shadow-[0_0_24px_rgba(0,212,255,0.4)] transition-all flex items-center gap-2 whitespace-nowrap lg:text-base"
                  >
                    File a Complaint →
                  </button>
                )}

                {isUserLoggedIn() ? (
                  <Link to="/status" className="bg-transparent border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-secondary px-8 py-3 rounded-lg font-medium hover:border-cyan hover:text-cyan dark:hover:border-cyan-dark dark:hover:text-cyan-dark transition-all whitespace-nowrap shadow-sm dark:shadow-none lg:text-base">
                    Track My Case
                  </Link>
                ) : (
                  <button
                    onClick={showAuthModal}
                    className="bg-transparent border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-secondary px-8 py-3 rounded-lg font-medium hover:border-cyan hover:text-cyan dark:hover:border-cyan-dark dark:hover:text-cyan-dark transition-all whitespace-nowrap shadow-sm dark:shadow-none lg:text-base"
                  >
                    Track My Case
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">
                <span>27 Crime Categories</span>
                <span>·</span>
                <span>BNS 2024 Legal</span>
                <span>·</span>
                <span>Instant FIR Email</span>
              </div>
            </div>

            {/* RIGHT HALF */}
            <div className="hidden lg:block w-full h-[500px] relative">
              <BnsTerminal />
            </div>
          </div>
        </section>

        {/* SECTION 2 — TRUST INDICATORS */}
        <section className="w-full bg-[#050812] border-y border-white/5 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent_70%)]" />
          <div className="max-w-[1280px] w-full px-8 mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {[
                { label: "Multilingual Support", value: "3+ Langs", color: "cyan", detail: "Hindi, Hinglish & English" },
                { label: "Service Status", value: "Always On", color: "emerald", detail: "24/7 AI-Powered Support" },
                { label: "Official Access", value: "100% Free", color: "indigo", detail: "No Fees for Citizens" },
                { label: "Data Protection", value: "Private", color: "rose", detail: "Secure Forensic Handling" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0D1526]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] group hover:border-white/10 transition-all text-center lg:text-left"
                >
                  <div className={`text-${stat.color}-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4`}>{stat.label}</div>
                  <div className="text-4xl font-black text-white tracking-tighter mb-2 group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                  <div className="text-[10px] text-[#475569] font-mono tracking-tighter">{stat.detail}</div>
                  <div className="absolute top-4 right-6 w-12 h-12 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan/10 transition-all" />
                </motion.div>
              ))}
            </div>

            <LiveIntelligenceMatrix />
          </div>
        </section>

        {/* SECTION 3 — SIMPLIFIED PIPELINE */}
        <section className="w-full py-40 bg-transparent relative flex flex-col items-center">
          <div className="max-w-[1280px] w-full px-8">
            <div className="flex flex-col items-center text-center mb-24">
              <span className="text-cyan text-[10px] font-black tracking-[0.4em] uppercase mb-4">How It Works</span>
              <h2 className="text-5xl font-black tracking-tight text-white m-0 p-0">From Complaint to FIR in Seconds</h2>
              <p className="text-[#64748B] text-lg mt-4 max-w-2xl font-medium">Simple steps to file your cybercrime report and get professional legal documentation instantly.</p>
            </div>

            <div className="relative w-full overflow-hidden lg:overflow-visible">
              <div className="absolute top-[44px] left-0 right-0 h-[2px] bg-white/5 hidden lg:block">
                <motion.div
                  animate={{ x: [-1280, 1280] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-[300px] h-full bg-gradient-to-r from-transparent via-cyan to-transparent opacity-40 shadow-[0_0_15px_#22D3EE]"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
                {[
                  { step: "01", title: "Share Case", desc: "Type Your Story", icon: FileText, detail: "Explain the crime in your own language." },
                  { step: "02", title: "Auto-Scan", desc: "Smart Detection", icon: GlobeIcon, detail: "AI understands your language instantly." },
                  { step: "03", title: "Translation", desc: "English Mapping", icon: Languages, detail: "Converted to official English format." },
                  { step: "04", title: "AI Legal Check", desc: "BNS Law Match", icon: Brain, detail: "AI maps the crime to Indian Law (BNS)." },
                  { step: "05", title: "Final Receipt", desc: "FIR Ready", icon: Mail, detail: "Download your professional draft instantly." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="relative flex flex-col items-center lg:items-start group"
                  >
                    <div className="w-20 h-20 rounded-[1.5rem] bg-[#0A0F1E] border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-cyan/50 shadow-2xl transition-all duration-500">
                      <item.icon size={32} className="text-[#475569] group-hover:text-cyan transition-colors" />
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#050812] border border-white/10 flex items-center justify-center text-[10px] font-black text-cyan shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <div className="text-center lg:text-left">
                      <h4 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-cyan transition-colors">{item.title}</h4>
                      <p className="text-[11px] text-[#475569] font-black uppercase tracking-widest mb-3">{item.desc}</p>
                      <p className="text-xs text-[#94A3B8] leading-relaxed font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — EMERGENCY STRIP */}
        <section className="w-full bg-[#110101] border-y border-red-500/10 py-12 flex flex-col items-center">
          <div className="max-w-[1280px] w-full px-8 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex flex-col">
              <span className="text-red-500 text-[10px] font-black tracking-[0.4em] uppercase mb-2">Emergency Hub</span>
              <div className="text-stone-300 text-sm font-medium">Verified National Helplines Only:</div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { label: "1930", title: "Cyber Crime", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" },
                { label: "112", title: "Emergency", glow: "" },
                { label: "100", title: "Police", glow: "" },
                { label: "1091", title: "Women Support", glow: "" },
              ].map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.label}`}
                  className={`group bg-[#1A0505] border border-red-500/20 px-6 py-4 rounded-2xl flex flex-col items-center hover:border-red-500/50 transition-all ${h.glow}`}
                >
                  <span className="text-red-500 text-2xl font-black tracking-tighter group-hover:scale-110 transition-transform">{h.label}</span>
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-1">{h.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 5 — FOOTER */}
      <footer className="w-full bg-light-bg-surface dark:bg-dark-bg-surface border-t border-light-border-default dark:border-dark-border-default py-12 px-8 flex flex-col items-center mt-auto shadow-sm dark:shadow-none">
        <div className="max-w-[1280px] w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 group mb-4">
              <div className="w-8 h-8 relative">
                 <img src="/logo.png" alt="CyberShield Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-light-text-primary dark:text-dark-text-primary font-black tracking-tight text-xl uppercase italic">
                Cyber<span className="text-cyan dark:text-cyan-dark not-italic">Shield</span>
              </span>
            </div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1 font-medium max-w-xs">AI-Powered Cybercrime Intelligence Platform</p>
            <div className="mt-4 text-xs text-light-text-secondary/60 dark:text-dark-text-secondary/60 font-semibold tracking-wider uppercase">
              © {new Date().getFullYear()} CyberShield. All rights are claimed.
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <div className="flex flex-wrap items-center gap-6">
              <Link to="/" className="text-light-text-secondary hover:text-light-text-primary dark:text-dark-text-secondary dark:hover:text-cyan-dark text-sm transition font-medium">Home</Link>
              <Link to="/how-it-works" className="text-light-text-secondary hover:text-light-text-primary dark:text-dark-text-secondary dark:hover:text-cyan-dark text-sm transition font-medium">Pipeline</Link>
              <Link to="/admin/login" className="text-light-text-secondary hover:text-light-text-primary dark:text-dark-text-secondary dark:hover:text-cyan-dark text-sm transition font-medium">SOC Admin</Link>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs font-bold uppercase tracking-wider">Built with BNS 2024 · GRIET CSE · Hyderabad</p>
              <p className="text-cyan dark:text-cyan-dark text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                Developed by OMKAR RAICHUR
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
