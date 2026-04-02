import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Activity, MapPin, Loader2, AlertCircle,
  ArrowLeft, RefreshCw, Clock, User, Phone, Fingerprint,
  RadioTower, CheckCircle2, Lock, Eye, Zap, Brain, Database, Scale
} from 'lucide-react';
import { getCaseStatus } from '../lib/api';
import { Complaint, HistoryEntry } from '../types';

// ── Status progression config ──────────────────────────────────
const STAGES = [
  { key: 'RECEIVED',             label: 'Received',          icon: <Database size={16} />,  color: '#64748B' },
  { key: 'ASSIGNED',             label: 'Assigned',          icon: <User size={16} />,      color: '#60A5FA' },
  { key: 'UNDER_INVESTIGATION',  label: 'Under Review',      icon: <Eye size={16} />,       color: '#00D4FF' },
  { key: 'RESOLVED',             label: 'Resolved',          icon: <CheckCircle2 size={16}/>, color: '#22C55E' },
];

const STATUS_ORDER = ['RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'];

function getSeverityStyle(severity?: string) {
  const map: Record<string, { bg: string; text: string; glow: string; border: string }> = {
    Critical: { bg: 'rgba(239,68,68,0.1)',  text: '#EF4444', glow: 'rgba(239,68,68,0.3)',  border: 'rgba(239,68,68,0.3)'  },
    High:     { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', glow: 'rgba(245,158,11,0.3)', border: 'rgba(245,158,11,0.3)' },
    Medium:   { bg: 'rgba(234,179,8,0.1)',  text: '#EAB308', glow: 'rgba(234,179,8,0.3)',  border: 'rgba(234,179,8,0.3)'  },
    Low:      { bg: 'rgba(34,197,94,0.1)',  text: '#22C55E', glow: 'rgba(34,197,94,0.3)',  border: 'rgba(34,197,94,0.3)'  },
  };
  return map[severity || ''] || map.Medium;
}

export const CaseTracker = () => {
  const { ref_no } = useParams<{ ref_no: string }>();
  const [data, setData] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState(false);
  const [tick, setTick] = useState(0);

  const fetchStatus = async (silent = false) => {
    if (!ref_no) return;
    try {
      if (!silent) setLoading(true);
      else setIsPolling(true);
      const res = await getCaseStatus(ref_no);
      setData(res.data);
      setLastRefreshed(new Date());
      setError('');
    } catch (err: any) {
      if (!silent) setError(err.response?.data?.error || 'Failed to fetch case details.');
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(true), 30000);
    const tickInterval = setInterval(() => setTick(t => t + 1), 1000);
    return () => { clearInterval(interval); clearInterval(tickInterval); };
  }, [ref_no]);

  // ── Loading State ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center gap-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-[#00D4FF]/10 rounded-full border-t-[#00D4FF] animate-spin" />
          <div className="absolute inset-4 border-4 border-[#7C3AED]/10 rounded-full border-b-[#7C3AED] animate-spin animate-[spin_1.5s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Fingerprint size={28} className="text-[#00D4FF] animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-[11px] text-[#00D4FF] font-mono uppercase tracking-widest mb-2">Establishing Secure Uplink</div>
          <div className="text-xs text-[#64748B] font-mono animate-pulse">Fetching classified case file — {ref_no}</div>
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center pt-32 px-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 animate-pulse">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Case Not Found</h2>
        <p className="text-[#94A3B8] text-sm mb-8 text-center max-w-md">{error || 'The reference number you entered does not match any active case in our system.'}</p>
        <Link to="/status" className="flex items-center gap-2 text-[#00D4FF] text-sm font-bold uppercase tracking-widest hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Return to Search
        </Link>
      </div>
    );
  }

  const sev = getSeverityStyle(data.severity);
  const currentStageIdx = STATUS_ORDER.indexOf(data.status);

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white relative overflow-hidden">
      
      {/* ── Animated Background ─────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full max-w-7xl h-full border-x border-white/[0.03] flex justify-evenly">
            {[...Array(5)].map((_, i) => <div key={i} className="w-px h-full bg-white/[0.03]" />)}
          </div>
        </div>
        {/* Radial glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00D4FF]/[0.04] blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* ── TOP NAV BAR ───────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link to="/status" className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] flex items-center justify-center transition-colors text-[#94A3B8] hover:text-white">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <RadioTower size={14} className="text-[#00D4FF]" />
                <span className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-widest">Live Intelligence Dashboard</span>
                <span className="flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest">UPLINK ACTIVE</span>
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">Case Intelligence Tracker</h1>
            </div>
          </div>

          {/* Refresh + Sync */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
              <Clock size={12} className="text-[#64748B]" />
              <span className="text-[10px] font-mono text-[#64748B]">Last sync: {lastRefreshed.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => fetchStatus(false)}
              disabled={isPolling || loading}
              className="flex items-center gap-2 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/15 border border-[#00D4FF]/20 text-[#00D4FF] text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw size={13} className={isPolling ? 'animate-spin' : ''} />
              Sync
            </button>
          </div>
        </div>

        {/* ── HERO: FIR ID + STATUS ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border mb-6"
          style={{ borderColor: sev.border, boxShadow: `0 0 40px ${sev.glow}` }}
        >
          {/* Severity color accent bar */}
          <div className="h-1" style={{ background: sev.text }} />
          
          <div className="bg-[#0D1526] p-8">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              
              {/* LEFT: FIR info */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                  <ShieldCheck size={26} className="text-[#00D4FF]" />
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] font-mono uppercase tracking-widest mb-1">Case Reference</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white mb-3">{data.ref_no}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {data.categories?.map((cat, i) => (
                      <span key={i} className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider">
                        {cat}
                      </span>
                    ))}
                    <span className="flex items-center gap-1 text-xs text-[#64748B]">
                      <MapPin size={11} /> {data.city} Jurisdiction
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Status + Severity */}
              <div className="flex flex-row lg:flex-col items-start lg:items-end gap-4">
                <div>
                  <div className="text-[10px] text-[#64748B] font-mono uppercase tracking-widest mb-2">Threat Level</div>
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest border"
                    style={{ background: sev.bg, color: sev.text, borderColor: sev.border }}
                  >
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: sev.text }} />
                    {data.severity}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] font-mono uppercase tracking-widest mb-2">Current Status</div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border ${
                    data.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    data.status === 'UNDER_INVESTIGATION' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30' :
                    data.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    'bg-white/[0.05] text-[#94A3B8] border-white/[0.08]'
                  }`}>
                    {data.status === 'UNDER_INVESTIGATION' && <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-ping" />}
                    {data.status === 'RESOLVED' && <CheckCircle2 size={13} />}
                    {data.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STAGE PROGRESS BAR ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0D1526] border border-white/[0.06] rounded-2xl p-6 mb-6"
        >
          <div className="text-[10px] text-[#64748B] font-mono uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap size={12} className="text-[#00D4FF]" /> Investigation Stage Tracker
          </div>
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute top-5 left-0 right-0 h-px bg-white/[0.06] z-0" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentStageIdx === -1 ? 0 : (currentStageIdx / (STAGES.length - 1)) * 100}%` }}
              className="absolute top-5 left-0 h-px bg-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.4)] z-0 transition-all duration-1000"
            />

            {STAGES.map((stage, i) => {
              const done = i < currentStageIdx;
              const active = i === currentStageIdx;
              const pending = i > currentStageIdx;
              return (
                <div key={stage.key} className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                      done ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' :
                      active ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.3)]' :
                      'border-white/[0.08] bg-white/[0.03] text-[#475569]'
                    } ${active ? 'animate-pulse' : ''}`}
                  >
                    {done ? <CheckCircle2 size={16} /> : stage.icon}
                  </div>
                  <div className={`text-[9px] font-bold uppercase tracking-widest text-center ${
                    done ? 'text-emerald-400' : active ? 'text-[#00D4FF]' : 'text-[#475569]'
                  }`}>
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── MAIN 3-COL GRID ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity Log — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#0D1526] border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#00D4FF]" />
                <span className="text-sm font-bold text-white">Investigation Activity Log</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Live Feed</span>
              </div>
            </div>

            <div className="p-6">
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-1.5 top-2 bottom-4 w-px bg-gradient-to-b from-[#00D4FF]/40 via-white/[0.05] to-transparent" />

                <div className="flex flex-col gap-7">
                  {/* History entries */}
                  {data.history && data.history.length > 0 ? (
                    data.history.map((h: HistoryEntry, i: number) => (
                      <div key={i} className="relative pl-8">
                        {/* Node */}
                        <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center
                          ${i === 0
                            ? 'border-[#00D4FF] bg-[#0A0F1E] shadow-[0_0_12px_rgba(0,212,255,0.6)]'
                            : 'border-white/20 bg-[#0A0F1E]'
                          }`}
                        >
                          {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />}
                        </div>

                        <div className={`rounded-xl border p-4 transition-all ${i === 0 ? 'border-[#00D4FF]/20 bg-[#00D4FF]/[0.04]' : 'border-white/[0.04] bg-white/[0.02]'}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-ping shrink-0" />}
                              <span className={`text-xs font-black uppercase tracking-widest ${i === 0 ? 'text-[#00D4FF]' : 'text-[#E2E8F0]'}`}>
                                {h.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#64748B]">
                              {new Date(h.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-[#94A3B8] leading-relaxed">{h.note}</p>
                          {h.officer && (
                            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#64748B]">
                              <User size={10} /> Officer: <span className="font-bold text-[#94A3B8]">{h.officer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pl-8 text-xs text-[#64748B] italic py-4">Awaiting initial review by investigating officer...</div>
                  )}

                  {/* Origin Node — always shown */}
                  <div className="relative pl-8 opacity-50">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 z-10 border-[#475569] bg-[#0A0F1E]" />
                    <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-[#475569]">
                          E-FIR Registered
                        </span>
                        <span className="text-[10px] font-mono text-[#475569]">
                          {new Date(data.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        Complaint received and encrypted by CyberShield National Intelligence Engine. AI classification pipeline initiated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-5">

            {/* Classified Intel Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#0D1526] border border-white/[0.06] rounded-2xl overflow-hidden"
            >
              <div className="border-b border-white/[0.05] px-5 py-3 flex items-center gap-2">
                <Lock size={13} className="text-[#64748B]" />
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Assigned Officer</span>
              </div>
              <div className="p-5">
                {data.assigned_officer ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center shrink-0">
                        <User size={18} className="text-[#00D4FF]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{data.assigned_officer}</div>
                        <div className="text-[10px] text-[#64748B]">{data.city} Cyber Cell</div>
                      </div>
                    </div>
                    <div className="bg-[#00D4FF]/[0.04] border border-[#00D4FF]/10 rounded-lg p-3 text-[10px] text-[#94A3B8] font-mono">
                      Quote <span className="text-[#00D4FF] font-bold">{data.ref_no}</span> in all communications.
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4 gap-3 text-center">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                      <Clock size={18} className="text-[#475569]" />
                    </div>
                    <div className="text-xs text-[#64748B]">Assignment pending.<br/>An officer will be assigned shortly.</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Complainant Record */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-[#0D1526] border border-white/[0.06] rounded-2xl overflow-hidden"
            >
              <div className="border-b border-white/[0.05] px-5 py-3 flex items-center gap-2">
                <Fingerprint size={13} className="text-[#64748B]" />
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Complainant Record</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#475569] mb-1">Legal Name</div>
                  <div className="text-sm font-bold text-white">{data.victim_name}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#475569] mb-1">Contact</div>
                  <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <Phone size={12} className="text-[#64748B]" />
                    {data.victim_phone || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#475569] mb-1">Department</div>
                  <div className="text-xs text-[#94A3B8] leading-relaxed">{data.department || 'Pending routing'}</div>
                </div>
              </div>
            </motion.div>

            {/* AI Intelligence Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-[#0D1526] border border-[#7C3AED]/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.07)]"
            >
              <div className="border-b border-[#7C3AED]/10 px-5 py-3 flex items-center gap-2">
                <Brain size={13} className="text-[#7C3AED]" />
                <span className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest">AI Classification</span>
              </div>
              <div className="p-5 space-y-4">
                {/* BNS sections */}
                {data.bns_sections && data.bns_sections.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#475569] mb-2 flex items-center gap-1">
                      <Scale size={10} /> BNS 2024 Sections
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {data.bns_sections.slice(0, 3).map((s, i) => (
                        <div key={i} className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-lg px-3 py-2 text-[10px] text-[#A78BFA] font-mono">
                          {s}
                        </div>
                      ))}
                      {data.bns_sections.length > 3 && (
                        <div className="text-[9px] text-[#64748B] text-center mt-1">+{data.bns_sections.length - 3} more sections</div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#475569] mb-1">Detected Language</div>
                  <div className="text-xs text-[#7C3AED] capitalize font-bold">{data.detected_language}</div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── FOOTER AUTO-REFRESH NOTICE ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono text-[#334155]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#334155] animate-pulse" />
          Auto-syncing every 30 seconds &nbsp;|&nbsp; Case ID: {data.ref_no} &nbsp;|&nbsp; CyberShield National Intelligence Platform
        </motion.div>

      </div>
    </div>
  );
};

