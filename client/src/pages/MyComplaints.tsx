import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Clock, CheckCircle2, AlertCircle, ChevronRight,
  RefreshCw, Loader2, FileSearch, RadioTower, Fingerprint,
  Filter, Plus, Activity, Eye, Database, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyCases } from '../lib/api';
import { Complaint } from '../types';

// ── Helpers ─────────────────────────────────────────────────
const STATUS_ORDER = ['RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'];

function getSeverityStyle(severity?: string) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    Critical: { bg: 'rgba(239,68,68,0.1)',  text: '#EF4444', border: 'rgba(239,68,68,0.25)'  },
    High:     { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
    Medium:   { bg: 'rgba(234,179,8,0.1)',  text: '#EAB308', border: 'rgba(234,179,8,0.25)'  },
    Low:      { bg: 'rgba(34,197,94,0.1)',  text: '#22C55E', border: 'rgba(34,197,94,0.25)'  },
  };
  return map[severity || ''] || map.Medium;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'RESOLVED':            return { label: 'Resolved',         color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   icon: <CheckCircle2 size={13} /> };
    case 'UNDER_INVESTIGATION': return { label: 'Under Review',     color: '#00D4FF', bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.25)',   icon: <Eye size={13} /> };
    case 'ASSIGNED':            return { label: 'Assigned',         color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)',  icon: <User size={13} /> };
    default:                    return { label: 'Received',         color: '#64748B', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)',  icon: <Database size={13} /> };
  }
}

const FILTERS = ['All', 'RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'];

// ── Animated stat counter ────────────────────────────────────
const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) => (
  <div className="bg-[#0D1526] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3 flex-1 min-w-[120px]">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <div className="text-xl font-black text-white leading-tight">{value}</div>
      <div className="text-[9px] font-bold text-[#475569] uppercase tracking-widest">{label}</div>
    </div>
  </div>
);

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCases = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await getMyCases();
      setComplaints(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err: any) {
      setError('Failed to load your cases. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCases();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchCases(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

  // Stats
  const stats = {
    total:        complaints.length,
    active:       complaints.filter(c => c.status !== 'RESOLVED').length,
    resolved:     complaints.filter(c => c.status === 'RESOLVED').length,
    critical:     complaints.filter(c => c.severity === 'Critical').length,
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-[#00D4FF]/10 rounded-full border-t-[#00D4FF] animate-spin" />
          <div className="absolute inset-4 border-4 border-[#7C3AED]/10 rounded-full border-b-[#7C3AED] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Fingerprint size={22} className="text-[#00D4FF] animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[#00D4FF] font-mono uppercase tracking-widest mb-1">Retrieving Case Records</div>
          <div className="text-xs text-[#334155] font-mono animate-pulse">Fetching from secure database...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white relative overflow-hidden">

      {/* ── Background ─────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full max-w-7xl h-full border-x border-white/[0.025] flex justify-evenly">
            {[...Array(5)].map((_, i) => <div key={i} className="w-px h-full bg-white/[0.025]" />)}
          </div>
        </div>
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-[#7C3AED]/[0.03] blur-3xl rounded-full" />
        <div className="absolute top-24 left-1/4 w-[500px] h-[300px] bg-[#00D4FF]/[0.03] blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RadioTower size={13} className="text-[#00D4FF]" />
              <span className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-widest">Citizen Case Registry</span>
              <span className="flex items-center gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-mono uppercase">Live</span>
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">My Complaints</h1>
            <p className="text-sm text-[#64748B]">Real-time view of all your registered cybercrime cases</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchCases(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-[#64748B] hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Sync
            </button>
            <Link
              to="/complaint"
              className="flex items-center gap-2 bg-[#00D4FF] hover:bg-[#00BBDD] text-[#0A0F1E] font-black text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all"
            >
              <Plus size={14} />
              New Complaint
            </Link>
          </div>
        </div>

        {/* ── STATS ROW ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-8">
          <StatCard label="Total Cases"    value={stats.total}    color="#00D4FF" icon={<ShieldCheck size={16} />} />
          <StatCard label="Active"         value={stats.active}   color="#F59E0B" icon={<Activity size={16} />}    />
          <StatCard label="Resolved"       value={stats.resolved} color="#22C55E" icon={<CheckCircle2 size={16} />} />
          <StatCard label="Critical"       value={stats.critical} color="#EF4444" icon={<AlertCircle size={16} />} />
        </div>

        {/* ── FILTER TABS ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Filter size={13} className="text-[#475569] mr-1" />
          {FILTERS.map(f => {
            const count = f === 'All' ? complaints.length : complaints.filter(c => c.status === f).length;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border ${
                  active
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30'
                    : 'bg-white/[0.03] text-[#475569] border-white/[0.05] hover:border-white/[0.1] hover:text-[#94A3B8]'
                }`}
              >
                {f === 'All' ? 'All' : f.replace(/_/g, ' ')}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${active ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-white/[0.06] text-[#334155]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── ERROR ────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6 text-sm text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── CASE LIST ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 && !error ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <FileSearch size={26} className="text-[#334155]" />
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-white mb-1">
                  {filter === 'All' ? 'No Cases Registered' : `No ${filter.replace(/_/g, ' ')} Cases`}
                </div>
                <div className="text-sm text-[#475569] mb-6">
                  {filter === 'All'
                    ? 'You have not filed any complaints yet. Use the button above to file your first E-FIR.'
                    : 'No cases match this filter. Try selecting a different status.'}
                </div>
                {filter === 'All' && (
                  <Link
                    to="/complaint"
                    className="inline-flex items-center gap-2 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/15 border border-[#00D4FF]/25 text-[#00D4FF] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all"
                  >
                    <Plus size={14} /> File First Complaint
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" className="flex flex-col gap-3">
              {filtered.map((c, idx) => {
                const sev = getSeverityStyle(c.severity);
                const st  = getStatusConfig(c.status);
                return (
                  <motion.div
                    key={c.ref_no}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="group relative"
                  >
                    {/* Severity glow bar on left */}
                    <div
                      className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all group-hover:opacity-100 opacity-60"
                      style={{ background: sev.text }}
                    />

                    <div className="bg-[#0D1526] hover:bg-[#0F1A2E] border border-white/[0.05] hover:border-white/[0.1] rounded-2xl pl-5 pr-5 py-5 transition-all ml-2">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">

                        {/* LEFT: ref + meta */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Status icon circle */}
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{ background: st.bg, borderColor: st.border }}
                          >
                            <span style={{ color: st.color }}>{st.icon}</span>
                          </div>

                          <div className="min-w-0">
                            {/* FIR number */}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-base font-black font-mono text-white tracking-tight truncate">
                                {c.ref_no}
                              </span>
                              {/* Severity badge */}
                              <span
                                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                                style={{ background: sev.bg, color: sev.text, borderColor: sev.border }}
                              >
                                {c.severity}
                              </span>
                            </div>

                            {/* Category + date + city */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#64748B]">
                              <span className="text-[#94A3B8] font-semibold">
                                {c.categories?.join(' / ') || 'Unclassified'}
                              </span>
                              <span className="hidden sm:inline text-[#334155]">·</span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              {c.city && (
                                <>
                                  <span className="hidden sm:inline text-[#334155]">·</span>
                                  <span>{c.city} Cyber Cell</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: status badge + progress + action */}
                        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">

                          {/* Mini stage progress dots */}
                          <div className="flex items-center gap-1">
                            {STATUS_ORDER.map((s, i) => {
                              const idx = STATUS_ORDER.indexOf(c.status);
                              const done   = i < idx;
                              const active = i === idx;
                              return (
                                <div
                                  key={s}
                                  className={`rounded-full transition-all ${
                                    active ? 'w-2 h-2' : 'w-1.5 h-1.5'
                                  }`}
                                  style={{
                                    background: done || active ? st.color : 'rgba(255,255,255,0.08)',
                                    boxShadow: active ? `0 0 6px ${st.color}` : 'none'
                                  }}
                                />
                              );
                            })}
                          </div>

                          {/* Status badge */}
                          <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border"
                            style={{ background: st.bg, color: st.color, borderColor: st.border }}
                          >
                            {c.status === 'UNDER_INVESTIGATION' && (
                              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: st.color }} />
                            )}
                            {st.label}
                          </div>

                          {/* Arrow CTA */}
                          <Link
                            to={`/track/${c.ref_no}`}
                            className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-[#00D4FF]/10 border border-white/[0.06] hover:border-[#00D4FF]/25 flex items-center justify-center transition-all group/btn shrink-0"
                          >
                            <ChevronRight size={16} className="text-[#475569] group-hover/btn:text-[#00D4FF] transition-colors" />
                          </Link>
                        </div>

                      </div>

                      {/* BNS + department row */}
                      {(c.department || (c.bns_sections && c.bns_sections.length > 0)) && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                          {c.department && (
                            <span className="text-[9px] font-mono text-[#475569] bg-white/[0.03] border border-white/[0.04] rounded-md px-2 py-1">
                              → {c.department}
                            </span>
                          )}
                          {c.bns_sections?.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[9px] font-mono text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-md px-2 py-1">
                              {s.split(':')[0].trim()}
                            </span>
                          ))}
                          {(c.bns_sections?.length ?? 0) > 2 && (
                            <span className="text-[9px] text-[#334155] font-mono">+{(c.bns_sections?.length ?? 0) - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        {complaints.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono text-[#1E293B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E293B] animate-pulse" />
            Auto-syncing every 60 seconds · {complaints.length} case{complaints.length !== 1 ? 's' : ''} on record · CyberShield National Intelligence Platform
          </div>
        )}

      </div>
    </div>
  );
};
