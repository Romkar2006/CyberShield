import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Download, Ban, BrainCircuit, Activity, 
  FileText, MapPin, Grid, Users, Shield, Clock, User,
  Database, Eye, CheckCircle2, Archive
} from 'lucide-react';
import { getCaseStatus, updateCaseStatus } from '../lib/api';
import { Complaint, HistoryEntry } from '../types';
import { PageLoader } from '../components/shared/PageLoader';
import { CaseControlPanel } from '../components/admin/CaseControlPanel';
import { motion } from 'framer-motion';

const STAGES = [
  { key: 'RECEIVED',            label: 'Received',     icon: <Database size={16} /> },
  { key: 'ASSIGNED',            label: 'Assigned',     icon: <User size={16} /> },
  { key: 'UNDER_INVESTIGATION', label: 'Under Review', icon: <Eye size={16} /> },
  { key: 'RESOLVED',            label: 'Resolved',     icon: <CheckCircle2 size={16} /> },
];
const STATUS_ORDER = ['RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'];

export const AdminCaseDetail = () => {
  const { ref } = useParams<{ ref: string }>();
  const [data, setData] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCase = async (silent = false) => {
    if (!ref) return;
    try {
      if (!silent) setLoading(true);
      const res = await getCaseStatus(ref);
      setData(res.data);
    } catch (err: any) {
      if (!silent) setError(err.response?.data?.error || 'Failed to load case details');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase(false);
    
    // Auto-refresh every 30s to keep it dynamic
    const interval = setInterval(() => fetchCase(true), 30000);
    return () => clearInterval(interval);
  }, [ref]);

  const handleCaseUpdate = (updated: Complaint) => {
    setData(updated);
  };

  const handleEndCase = async () => {
    if (!data || !ref) return;
    if (!window.confirm('Are you sure you want to end this case and mark it as RESOLVED? This action is permanent.')) return;
    
    try {
      setLoading(true);
      const res = await updateCaseStatus({
        ref_no: ref,
        status: 'RESOLVED',
        note: 'Case formally ended and resolved by administrative officer.'
      });
      setData(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to resolve case');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center"><PageLoader /></div>;
  if (error || !data) return <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center">{error || 'Case not found'}</div>;

  return (
    <div className="w-full relative flex flex-col gap-6">
      {/* Local header removed and handled by global AdminHeader */}

      {/* Main Title Banner */}
      <div className="bg-[#0D1526] border border-white/[0.06] rounded-xl p-6 mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-cyan-dark/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">{data.categories?.[0] || 'Unclassified Investigation'}</h1>
              {data.severity === 'Critical' && <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider animate-pulse">Critical</span>}
              {data.severity === 'High' && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">High</span>}
              {data.severity === 'Medium' && <span className="bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Medium</span>}
              {data.severity === 'Low' && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Low</span>}
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[#94A3B8] text-sm font-medium mt-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${data.status === 'RESOLVED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,1)] animate-pulse'}`}></span>
                <span className={`font-black tracking-widest ${data.status === 'RESOLVED' ? 'text-emerald-500' : 'text-[#00D4FF]'}`}>{data.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} /> Created: <span className="text-white">{new Date(data.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} /> Victim: <span className="text-white">{data.victim_name || 'ANONYMOUS'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> City: <span className="text-white">{data.city}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-[#0F172A] border border-white/[0.1] hover:bg-white/[0.05] rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold transition text-[#94A3B8] hover:text-white">
              <Download size={16} /> Export Intelligence
            </button>
            {data.status !== 'RESOLVED' && (
              <button 
                onClick={handleEndCase}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-lg px-5 py-2 flex items-center gap-2 text-sm font-bold transition shadow-[0_0_15px_rgba(16,185,129,0.1)] uppercase tracking-wider group"
              >
                <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" /> 
                END THE CASE
              </button>
            )}
          </div>
        </div>

        {/* ── STAGE PROGRESS BAR (DYNAMIC STATUS LINE) ── */}
        <div className="bg-[#0D1526] border border-white/[0.08] rounded-xl p-8 mb-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-dark/20 to-transparent"></div>
           <div className="flex items-center justify-between relative">
              {/* Connector */}
              <div className="absolute top-5 left-0 right-0 h-px bg-white/[0.08]"></div>
              {/* Progress Line */}
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(STATUS_ORDER.indexOf(data.status) / (STATUS_ORDER.length - 1)) * 100}%` }}
                 className="absolute top-5 left-0 h-px bg-cyan-dark shadow-[0_0_10px_rgba(0,212,255,0.5)] transition-all duration-1000"
              />
              {STAGES.map((stage, i) => {
                 const currentIdx = STATUS_ORDER.indexOf(data.status);
                 const active = i === currentIdx;
                 const done = i < currentIdx;
                 return (
                    <div key={stage.key} className="relative z-10 flex flex-col items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                          done ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                          active ? 'bg-cyan-dark/10 border-cyan-dark text-cyan-dark shadow-[0_0_20px_rgba(0,212,255,0.2)] scale-110' : 
                          'bg-white/5 border-white/5 text-[#475569]'
                       } ${active ? 'animate-pulse' : ''}`}>
                          {done ? <CheckCircle2 size={18} /> : stage.icon}
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${done ? 'text-emerald-500' : active ? 'text-cyan-dark' : 'text-[#475569]'}`}>
                          {stage.label}
                       </span>
                    </div>
                 )
              })}
           </div>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: EVIDENCE & TIMELINE */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Victim Statement */}
            <div className="bg-[#0D1526] border border-white/[0.06] rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                <FileText size={80} />
              </div>
              <div className="text-[10px] uppercase font-black text-cyan-dark mb-4 tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-dark rounded-full"></div> VICTIM STATEMENT (TRANSLATED)
              </div>
              <p className="text-[15px] text-[#E2E8F0] italic leading-relaxed relative z-10 font-['Outfit',sans-serif]">
                "{data.translated_text}"
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <div className="text-[10px] uppercase font-bold text-[#64748B] mb-2 tracking-[0.2em]">Original Text Source</div>
                <p className="text-xs text-[#64748B] line-clamp-3 leading-snug">
                  {data.original_text}
                </p>
              </div>
            </div>

            {/* AI Analysis section */}
            <div className="bg-[#0D1526] border border-indigo-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] group-hover:bg-indigo-500/10 transition-all duration-700"></div>
              <div className="text-[10px] uppercase font-black text-indigo-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                <BrainCircuit size={14} /> BNS 2024 LEGAL MAPPING
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                {data.bns_sections && data.bns_sections.length > 0 ? data.bns_sections.map((bns, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-lg hover:border-indigo-500/30 transition-all hover:bg-white/[0.08]">
                    <div className="text-sm font-bold text-white mb-1"><span className="text-indigo-400">Section</span> {bns.split(':')[0]}</div>
                    <p className="text-[#94A3B8] text-[11px] leading-relaxed font-medium uppercase tracking-tighter opacity-80">{bns.includes(':') ? bns.split(':')[1] : 'Bharatiya Nyaya Sanhita mapped clause.'}</p>
                  </div>
                )) : (
                  <div className="text-xs text-[#64748B] italic p-4 border border-dashed border-white/10 rounded-lg text-center">No BNS mappings documented.</div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.04]">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#64748B] mb-3 uppercase tracking-widest">
                  <span>Origin HUB</span>
                  <span className="text-cyan-dark">{data.city}</span>
                </div>
                <div className="w-full h-1 bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-dark w-[65%] rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Investigation Timeline */}
          <div className="bg-[#0D1526] border border-white/[0.08] rounded-xl flex flex-col relative overflow-hidden shadow-2xl min-h-[400px]">
            <div className="p-5 border-b border-white/[0.06] flex justify-between items-center bg-[#0F172A]/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Activity className="text-cyan-dark" size={18} />
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Live Investigation Log</h2>
              </div>
              <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">
                {data.history?.length || 0} Events Recorded
              </div>
            </div>

            <div className="p-8 relative">
              <div className="absolute top-8 bottom-8 left-[43px] w-[2px] bg-gradient-to-b from-cyan-dark via-indigo-500 to-transparent opacity-20"></div>

              <div className="flex flex-col gap-10">
                {data.history && data.history.length > 0 ? [...data.history].reverse().map((h: HistoryEntry, i: number) => (
                  <div key={i} className="relative pl-14 group">
                    {/* Oracle indicator */}
                    <div className={`absolute left-[3px] top-1.5 w-[14px] h-[14px] rounded-full border-[3px] z-10 transition-all duration-500
                      ${i === 0 ? 'bg-cyan-dark border-cyan-dark shadow-[0_0_15px_rgba(0,212,255,0.6)] scale-110' : 'bg-dark-bg-sidebar border-[#1E293B] group-hover:border-cyan-dark/40'}`}>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`text-sm font-black uppercase tracking-widest ${i === 0 ? 'text-white' : 'text-[#64748B]'}`}>
                          {h.status.replace('_', ' ')}
                        </h3>
                        <span className="text-[10px] text-[#64748B] font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">{new Date(h.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`text-sm leading-relaxed p-4 rounded-lg border ${i === 0 ? 'bg-cyan-dark/5 border-cyan-dark/20 text-[#E2E8F0]' : 'bg-white/[0.02] border-white/5 text-[#94A3B8]'}`}>
                        {h.note}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-cyan-dark/20 flex items-center justify-center">
                          <User size={10} className="text-cyan-dark" />
                        </div>
                        <div className="text-[10px] font-bold text-cyan-dark/80 uppercase tracking-widest">
                          BY: {h.changed_by} {h.officer ? `| ASSIGNED: ${h.officer}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="pl-12 text-[#64748B] text-sm italic">Initializing investigation protocol... awaiting first official action.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION HUB */}
        <div className="lg:col-span-4 sticky top-6">
          <CaseControlPanel complaint={data} onUpdate={handleCaseUpdate} />

          {/* Quick Stats below control panel */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Response Time</div>
              <div className="text-xl font-bold text-white">4h 12m</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Confidence</div>
              <div className="text-xl font-bold text-emerald-500">94.2%</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


