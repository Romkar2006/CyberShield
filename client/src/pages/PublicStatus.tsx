import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, ShieldCheck, Activity, MapPin, Loader2, AlertCircle,
  Fingerprint, Lock, RadioTower, CheckCircle2, Database, User,
  Eye, Clock, ArrowRight, Zap, Scale, Brain
} from 'lucide-react';
import { getCaseStatus } from '../lib/api';
import { Complaint, HistoryEntry } from '../types';

// ── Stage progression config ──────────────────────────────────
const STAGES = [
  { key: 'RECEIVED',            label: 'Received',     icon: <Database size={14} /> },
  { key: 'ASSIGNED',            label: 'Assigned',     icon: <User size={14} /> },
  { key: 'UNDER_INVESTIGATION', label: 'Under Review', icon: <Eye size={14} /> },
  { key: 'RESOLVED',            label: 'Resolved',     icon: <CheckCircle2 size={14} /> },
];
const STATUS_ORDER = ['RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'];

function getSeverityStyle(severity?: string) {
  const map: Record<string, { bg: string; text: string; glow: string; border: string }> = {
    Critical: { bg: 'rgba(239,68,68,0.1)',  text: '#EF4444', glow: 'rgba(239,68,68,0.25)',  border: 'rgba(239,68,68,0.3)'  },
    High:     { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', glow: 'rgba(245,158,11,0.25)', border: 'rgba(245,158,11,0.3)' },
    Medium:   { bg: 'rgba(234,179,8,0.1)',  text: '#EAB308', glow: 'rgba(234,179,8,0.25)',  border: 'rgba(234,179,8,0.3)'  },
    Low:      { bg: 'rgba(34,197,94,0.1)',  text: '#22C55E', glow: 'rgba(34,197,94,0.25)',  border: 'rgba(34,197,94,0.3)'  },
  };
  return map[severity || ''] || map.Medium;
}

// ── Radar Scanner SVG ─────────────────────────────────────────
const RadarScanner = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
    <style>{`
      @keyframes radarSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .radar-sweep {
        transform-origin: 100px 100px;
        animation: radarSpin 2.5s linear infinite;
      }
    `}</style>

    {/* Outer ring */}
    <circle cx="100" cy="100" r="80" stroke="rgba(0,212,255,0.22)" strokeWidth="1.2" />
    {/* Inner rings */}
    {[60, 40, 20].map((r, i) => (
      <circle key={i} cx="100" cy="100" r={r} stroke="rgba(0,212,255,0.07)" strokeWidth="1" />
    ))}
    {/* Crosshairs */}
    <line x1="100" y1="22" x2="100" y2="178" stroke="rgba(0,212,255,0.07)" strokeWidth="1" />
    <line x1="22"  y1="100" x2="178" y2="100" stroke="rgba(0,212,255,0.07)" strokeWidth="1" />

    {/* Rotating radius line — pure CSS animation */}
    <line
      className="radar-sweep"
      x1="100" y1="100"
      x2="100" y2="21"
      stroke="#00D4FF"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Center dot */}
    <circle cx="100" cy="100" r="3.5" fill="#00D4FF" />
    <circle cx="100" cy="100" r="7"   fill="#00D4FF" fillOpacity="0.15" />
  </svg>
);




export const PublicStatus = () => {
  const [refNo, setRefNo] = useState('');
  const [data, setData] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchStatus = async (silent = false) => {
    if (!refNo.trim()) return;
    try {
      if (!silent) setLoading(true);
      const res = await getCaseStatus(refNo.trim().toUpperCase());
      setData(res.data);
      setError('');
    } catch (err: any) {
      if (!silent) setError(err.response?.data?.error || 'Tracking ID not found. Please verify your reference number.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(false);
  };

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => fetchStatus(true), 30000); // 30s poll
    return () => clearInterval(interval);
  }, [data?.ref_no]);

  const sev = data ? getSeverityStyle(data.severity) : null;
  const currentStageIdx = data ? STATUS_ORDER.indexOf(data.status) : -1;

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white relative overflow-hidden">

      {/* ── Animated Background ───────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full max-w-7xl h-full border-x border-white/[0.03] flex justify-evenly">
            {[...Array(6)].map((_, i) => <div key={i} className="w-px h-full bg-white/[0.03]" />)}
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[800px] h-[200px] sm:h-[400px] bg-[#00D4FF]/[0.03] blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24">

        {/* ── HERO SECTION ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12 mb-12 sm:mb-16">

          {/* Left: Radar + text */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4FF]/[0.07] border border-[#00D4FF]/20 mb-6"
            >
              <RadioTower size={12} className="text-[#00D4FF]" />
              <span className="text-[8px] sm:text-[10px] font-bold text-[#00D4FF] uppercase tracking-widest">Live Cyber Intelligence Hub</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight"
            >
              Track Your<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">
                {" "}Investigation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#64748B] text-xs sm:text-sm leading-relaxed max-w-sm mb-8 mx-auto lg:mx-0"
            >
              Live investigation updates, officer assignment, and legal section mapping through our secure intelligence uplink.
            </motion.p>

            {/* Encryption badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start"
            >
              {[['🔒', 'AES-256'], ['🛡️', 'SOC2'], ['⚡', 'Live']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] rounded-lg px-2.5 py-1.5">
                  <span className="text-xs sm:text-sm">{icon}</span>
                  <span className="text-[9px] sm:text-[10px] font-black text-[#64748B] uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Radar visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-40 h-40 lg:w-56 lg:h-56 shrink-0 relative order-1 lg:order-2"
          >
            <div className="absolute inset-0 bg-[#00D4FF]/[0.05] rounded-full blur-2xl" />
            <RadarScanner />
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
              <div key={i} className={`absolute w-4 sm:w-5 h-4 sm:h-5 ${pos} border-[#00D4FF]/30 ${i < 2 ? 'border-t' : 'border-b'} ${i % 2 === 0 ? 'border-l' : 'border-r'}`} />
            ))}
          </motion.div>
        </div>

        {/* ── SEARCH PANEL ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }} className="mb-8 sm:mb-12"
        >
          <div className="bg-[#0D1526] border border-white/[0.07] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#0A0F1E] border-b border-white/[0.05] px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                {['red', 'yellow', 'emerald'].map(c => <div key={c} className={`w-2 h-2 rounded-full bg-${c}-500/40`} />)}
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.04] rounded px-3 py-1">
                <Lock size={10} className="text-[#475569]" />
                <span className="text-[9px] font-mono text-[#475569]">SECURE NODE ACCESS</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="text-[9px] sm:text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Fingerprint size={12} className="text-[#00D4FF]" /> FIR Identity Trace
              </div>
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                <div className={`flex-1 relative flex items-center rounded-xl border bg-[#0A0F1E] transition-all ${focused ? 'border-[#00D4FF]/50 ring-1 ring-[#00D4FF]/20' : 'border-white/[0.08]'}`}>
                  <Search size={16} className="ml-4 text-[#475569]" />
                  <input
                    ref={inputRef} type="text" placeholder="CASE REF ID"
                    value={refNo} onChange={e => setRefNo(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className="flex-1 bg-transparent border-none outline-none text-white py-4 px-4 font-mono text-base uppercase tracking-widest placeholder:text-[#334155] placeholder:normal-case placeholder:tracking-normal"
                    required
                  />
                </div>
                <button
                  type="submit" disabled={loading || !refNo.trim()}
                  className="bg-[#00D4FF] hover:brightness-110 disabled:opacity-30 text-[#0A0F1E] font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Zap size={14} /> Trace</>}
                </button>
              </form>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── RESULTS ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {data && sev && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* FIR Identity Card */}
              <div className="bg-[#0D1526] border border-white/[0.07] rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF]/[0.03] blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex gap-4 sm:gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#00D4FF] shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div className="text-[9px] text-[#475569] font-black uppercase tracking-[0.2em] mb-1">Authenticated Trace Reference</div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-white mb-3 tracking-tight">{data.ref_no}</div>
                      <div className="flex flex-wrap gap-2">
                        {data.categories?.map(c => <span key={c} className="bg-white/5 border border-white/10 text-[#94A3B8] text-[8px] font-black uppercase px-2.5 py-1 rounded-md">{c}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase" style={{ color: sev.text }}>
                       <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sev.text }} /> {data.severity}
                    </div>
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] rounded-xl text-[10px] font-black uppercase">
                       {data.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Rail (Responsive) */}
              <div className="bg-[#0D1526] border border-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <div className="text-[9px] text-[#475569] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                   <Zap size={10} className="text-cyan-dark" /> Investigation Protocol Stage
                </div>
                
                {/* Horizontal on Desktop, Verticalish on Mobile but keeping rail aesthetic */}
                <div className="relative">
                  <div className="absolute top-5 left-4 right-4 h-0.5 bg-white/5 lg:block hidden" />
                  <div className="flex flex-col lg:flex-row justify-between relative z-10 gap-8 lg:gap-0">
                    {STAGES.map((stage, i) => {
                      const done = i < currentStageIdx;
                      const active = i === currentStageIdx;
                      return (
                        <div key={stage.key} className="flex lg:flex-col items-center gap-4 lg:gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                            done ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                            active ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.3)]' :
                            'bg-white/5 border-white/10 text-[#334155]'
                          }`}>
                            {done ? <CheckCircle2 size={16} /> : stage.icon}
                          </div>
                          <div className="flex flex-col lg:items-center">
                             <div className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-[#00D4FF]' : done ? 'text-emerald-500' : 'text-[#334155]'}`}>
                               {stage.label}
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Investigation Feed */}
              <div className="bg-[#0D1526] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#00D4FF]" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">Investigation Logs</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="relative pl-6">
                    <div className="absolute left-1.5 top-0 bottom-6 w-px bg-white/5" />
                    <div className="space-y-8">
                       {data.history?.length ? data.history.map((h, i) => (
                         <div key={i} className="relative pl-6 group">
                            <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-[#0A0F1E] z-10 ${i === 0 ? 'border-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.4)]' : 'border-white/20'}`} />
                            <div className="font-mono text-[9px] text-[#475569] mb-2">{new Date(h.timestamp).toLocaleString()}</div>
                            <div className={`p-4 rounded-xl border ${i === 0 ? 'bg-[#00D4FF]/5 border-[#00D4FF]/20' : 'bg-white/[0.02] border-white/10'}`}>
                               <div className="text-[10px] font-black text-white uppercase mb-1">{h.status.replace(/_/g, ' ')}</div>
                               <div className="text-xs text-[#94A3B8] leading-relaxed">{h.note}</div>
                            </div>
                         </div>
                       )) : (
                         <div className="text-xs text-[#475569] italic font-medium">Awaiting departmental update...</div>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BNS Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0D1526] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale size={13} className="text-purple-400" />
                    <span className="text-[9px] font-black text-[#475569] uppercase tracking-widest">BNS 2024 Indexing</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.bns_sections?.map(s => <span key={s} className="bg-purple-900/20 border border-purple-500/20 text-purple-400 text-[9px] font-black px-3 py-1.5 rounded-lg">{s}</span>)}
                  </div>
                </div>
                <Link to={`/track/${data.ref_no}`} className="bg-gradient-to-br from-[#00D4FF] to-[#0094FF] rounded-xl p-6 flex flex-col justify-between group hover:brightness-110 transition-all">
                  <div className="text-[9px] font-black text-[#0A0F1E] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Brain size={12} /> Live Dashboard
                  </div>
                  <div className="text-xs font-black text-[#0A0F1E] flex items-center justify-between">
                    OPEN FULL INTELLIGENCE PORTAL <ArrowRight size={14} />
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOOTER HINT ── */}
        {!data && !loading && !error && (
          <div className="mt-12 text-center text-[10px] text-[#334155] font-black uppercase tracking-[0.2em]">
            Autonomous Case Verification Node · 256-Bit SSL
          </div>
        )}

      </div>
    </div>
  );
};
