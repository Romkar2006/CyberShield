import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Folder, AlertTriangle, AlertCircle, CheckCircle, Network,
  Bell, Radio, Activity, Zap, Clock, ArrowUpRight, Eye,
  MapPin, RefreshCw, ChevronRight, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getDashboard, getActiveAlerts } from '../lib/api';
import { DashboardData, ScamAlert } from '../types';
import { PageLoader } from '../components/shared/PageLoader';

// Live clock hook
const useLiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
};

// Stagger animation for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.4, 0, 0.2, 1] as const }
  })
};

export const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [tacticalLogs, setTacticalLogs] = useState<{t: string, msg: string, op: string, c?: string}[]>([]);
  const clock = useLiveClock();

  // Initialize Tactical Logs from real data
  useEffect(() => {
    if (data?.complaints) {
      const initialLogs = data.complaints.slice(0, 4).map(c => ({
        t: new Date(c.createdAt).toLocaleTimeString([], { hour12: false }),
        msg: `New incoming incident ${c.ref_no} detected in ${c.city}.`,
        op: 'INF-FLW',
        c: c.severity === 'Critical' ? 'text-red-500' : 'text-cyan-dark'
      }));
      setTacticalLogs(initialLogs);
    }
  }, [data]);

  // Periodic System Logs to make the dashboard feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      const ops = ['SEC-CHK', 'GEO-MAP', 'PTN-DET', 'INF-FLW', 'SYS-HRT'];
      const msgs = [
        'System integrity verified. Nodes stable.',
        'Analyzing neural clusters in Northern region.',
        'Pattern recognition engine recalibrated.',
        'Active patrol on port 8080.',
        'Encrypted tunnel 09 established.'
      ];
      const randomIdx = Math.floor(Math.random() * ops.length);
      const newLog = {
        t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        msg: msgs[randomIdx],
        op: ops[randomIdx],
        c: randomIdx === 2 ? 'text-amber-500' : 'text-[#94A3B8]'
      };
      setTacticalLogs(prev => [newLog, ...prev.slice(0, 10)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalScan = async () => {
    setScanning(true);
    setScanProgress(0);
    
    // Simulate Scan Progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    // Initial scan log
    setTacticalLogs(prev => [{
      t: new Date().toLocaleTimeString([], { hour12: false }),
      msg: 'GLOBAL NEURAL SCAN INITIALIZED. Accessing deep-packet sensors...',
      op: 'SCN-INI',
      c: 'text-cyan-dark'
    }, ...prev]);

    // Perform real data refresh
    await fetchData(true);

    setTimeout(() => {
      setScanning(false);
      setTacticalLogs(prev => [{
        t: new Date().toLocaleTimeString([], { hour12: false }),
        msg: 'NEURAL SCAN COMPLETE. Intelligence vectors refreshed.',
        op: 'SCN-FIN',
        c: 'text-emerald-500'
      }, ...prev]);
    }, 3500);
  };

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [dashRes, alertRes] = await Promise.all([
        getDashboard(),
        getActiveAlerts()
      ]);
      setData(dashRes.data);
      setAlerts(alertRes.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to SOC Intelligence Hub');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Computed stats
  const insights = useMemo(() => {
    if (!data) return null;
    const total = data.stats.total;
    const resolved = data.stats.resolved;
    const pending = total - resolved;

    // Status breakdown
    const statusCounts = { RECEIVED: 0, ASSIGNED: 0, UNDER_INVESTIGATION: 0, RESOLVED: 0 };
    data.complaints.forEach(c => {
      if (statusCounts[c.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[c.status as keyof typeof statusCounts]++;
      }
    });

    // Category distribution (top 4)
    const catMap: Record<string, number> = {};
    data.complaints.forEach(c => {
      if (c.categories?.length) catMap[c.categories[0]] = (catMap[c.categories[0]] || 0) + 1;
    });
    const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

    return { total, resolved, pending, statusCounts, topCategories };
  }, [data]);

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, { bg: string; text: string; border: string }> = {
      Critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
      High: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
      Medium: { bg: 'bg-cyan-dark/10', text: 'text-cyan-dark', border: 'border-cyan-dark/30' },
      Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
    };
    const s = config[severity] || config.Low;
    return <span className={`${s.bg} ${s.text} border ${s.border} px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider`}>{severity}</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED': return <span className="bg-slate-800 text-slate-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-slate-700">Received</span>;
      case 'ASSIGNED': return <span className="bg-blue-900/40 text-blue-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-blue-800/50">Assigned</span>;
      case 'UNDER_INVESTIGATION': return (
        <span className="bg-purple-900/40 text-purple-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase flex items-center gap-1.5 border border-purple-800/50 whitespace-nowrap w-fit">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span> Investigating
        </span>
      );
      case 'RESOLVED': return <span className="bg-emerald-900/40 text-emerald-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-emerald-800/50">Resolved</span>;
      default: return null;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0A0F1E]"><PageLoader /></div>;

  return (
    <div className="w-full relative px-2 sm:px-0">
      {/* ══════════ NEURAL SCAN OVERLAY ══════════ */}
      {scanning && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0A0F1E]/90 backdrop-blur-xl p-4"
        >
          <div className="w-full max-w-[450px] bg-[#0D1526] border border-cyan-dark/30 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-10 shadow-[0_0_50px_rgba(0,212,255,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                className="h-full bg-cyan-dark shadow-[0_0_15px_rgba(0,212,255,0.8)]"
              />
            </div>
            
            <div className="flex flex-col items-center text-center gap-4 lg:gap-6">
              <div className="relative">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-cyan-dark/10 border border-cyan-dark/30 flex items-center justify-center animate-pulse">
                  <Radio size={28} className="lg:hidden text-cyan-dark" />
                  <Radio size={32} className="hidden lg:block text-cyan-dark" />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-3 lg:-inset-4 border border-dashed border-cyan-dark/20 rounded-full"
                />
              </div>

              <div>
                <h2 className="text-lg lg:text-xl font-black text-white uppercase tracking-widest font-['Outfit',sans-serif] mb-1">Neural Scan In Progress</h2>
                <div className="text-[8px] lg:text-[10px] text-cyan-dark font-black uppercase tracking-[0.3em] mb-4 lg:mb-6 flex items-center justify-center gap-2">
                   Node: 0x{Math.floor(Math.random() * 999)} <span className="animate-pulse text-emerald-500">●</span> Active Hub
                </div>
              </div>

              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-[8px] lg:text-[9px] text-[#64748B] text-left space-y-1 h-[80px] lg:h-[100px] overflow-hidden relative">
                <div className="animate-[scroll_10s_linear_infinite]">
                  <div>[SYS] Requesting regional sensor nodes...</div>
                  <div className="text-cyan-dark">[OK] Node Mumbai Online</div>
                  <div className="text-cyan-dark">[OK] Node Delhi Online</div>
                  <div>[SYS] Filtering UPI packet headers...</div>
                  <div className="text-amber-500">[WRN] Anomalous activity detected</div>
                  <div>[SYS] Re-indexing neural threat matrix...</div>
                  <div className="text-emerald-500">[OK] Syncing global ledger...</div>
                </div>
              </div>

              <div className="text-[11px] lg:text-[12px] font-black text-white tabular-nums tracking-widest">
                {scanProgress}% SYSTEM REFRESH
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-5 rounded-2xl flex items-center gap-4 mb-8 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm mb-0.5">Connection Error</h3>
            <p className="text-xs font-medium opacity-80">{error}</p>
          </div>
        </div>
      )}

      {data && insights && (
        <>
          {/* ══════════ STAT CARDS ══════════ */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-8">
            {[
              { label: 'Active Incidents', value: insights.total, icon: Folder, color: '#00D4FF', accent: 'border-b-cyan-dark', sub: 'Live database' },
              { label: 'Critical Alerts', value: data.stats.critical, icon: AlertTriangle, color: '#EF4444', accent: 'border-b-red-500', sub: 'Immediate action' },
              { label: 'High Priority', value: data.stats.high, icon: Zap, color: '#F59E0B', accent: 'border-b-amber-500', sub: 'Escalation queue' },
              { label: 'Investigating', value: insights.statusCounts.UNDER_INVESTIGATION, icon: Eye, color: '#8B5CF6', accent: 'border-b-purple-500', sub: 'Officers assigned' },
              { label: 'Resolved', value: insights.resolved, icon: CheckCircle, color: '#10B981', accent: 'border-b-emerald-500', sub: 'Cases closed' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className={`bg-[#0D1526] border border-white/5 ${stat.accent} border-b-2 rounded-xl lg:rounded-2xl p-4 lg:p-6 group transition-all cursor-default relative overflow-hidden`}
              >
                <div className="absolute -top-3 -right-3 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                  <stat.icon size={56} />
                </div>
                <div className="flex items-center gap-2 mb-2 lg:mb-3">
                  <stat.icon size={12} style={{ color: stat.color }} />
                  <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: stat.color }}>{stat.label}</span>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-white tracking-tighter tabular-nums mb-0.5 lg:mb-1">{stat.value}</div>
                <div className="text-[8px] lg:text-[9px] text-[#475569] font-bold uppercase tracking-widest">{stat.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* ══════════ INCIDENT QUEUE ══════════ */}
          <motion.div
            custom={6}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-[#0D1526] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl mb-8"
          >
            {/* Table header */}
            <div className="p-4 lg:p-5 border-b border-white/5 flex justify-between items-center bg-[#0F172A]/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-1.5 lg:w-2 h-6 lg:h-8 bg-cyan-dark rounded-full"></div>
                <div>
                  <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-wider font-['Outfit',sans-serif]">Incoming Incident Queue</h2>
                  <p className="text-[8px] lg:text-[9px] text-[#475569] font-bold uppercase tracking-widest mt-0.5">Real-time Triage Portal</p>
                </div>
              </div>
              <Link to="/admin/cases" className="text-cyan-dark text-[8px] lg:text-[10px] font-black hover:text-cyan-400 transition uppercase tracking-widest border border-cyan-dark/30 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full hover:bg-cyan-dark/5 flex items-center gap-1.5">
                View All <ChevronRight size={10} />
              </Link>
            </div>

            {/* Mobile View: Card List */}
            <div className="lg:hidden divide-y divide-white/[0.03]">
              {data.complaints.slice(0, 8).map((comp) => (
                <Link key={comp._id} to={`/admin/case/${comp.ref_no}`} className="p-4 flex flex-col gap-3 active:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="text-[10px] font-black font-mono text-cyan-dark mb-0.5">{comp.ref_no}</div>
                      <div className="text-xs font-black text-white uppercase tracking-tight">{comp.categories?.[0] || 'Unclassified'}</div>
                    </div>
                    {getSeverityBadge(comp.severity)}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[9px] text-[#475569] font-bold uppercase">
                      <MapPin size={10} /> {comp.city || 'Unknown'}
                    </div>
                    {getStatusBadge(comp.status)}
                  </div>
                </Link>
              ))}
              {data.complaints.length === 0 && (
                <div className="py-12 text-center text-[#475569] text-[10px] font-black uppercase tracking-widest">
                  Queue Empty
                </div>
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0A0F1E]/40">
                    <th className="py-4 px-5 text-[9px] font-black text-[#475569] uppercase tracking-[0.15em]">Case ID</th>
                    <th className="py-4 px-5 text-[9px] font-black text-[#475569] uppercase tracking-[0.15em]">Classification</th>
                    <th className="py-4 px-5 text-[9px] font-black text-[#475569] uppercase tracking-[0.15em] text-center">Threat</th>
                    <th className="py-4 px-5 text-[9px] font-black text-[#475569] uppercase tracking-[0.15em]">Status</th>
                    <th className="py-4 px-5 text-[9px] font-black text-[#475569] uppercase tracking-[0.15em]">Filed On</th>
                    <th className="py-4 px-5 text-[9px] font-black text-[#475569] uppercase tracking-[0.15em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {data.complaints.slice(0, 8).map((comp) => (
                    <tr key={comp._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <td className="py-4 px-5">
                        <div className="text-xs font-black font-mono text-[#94A3B8] group-hover:text-cyan-dark transition-colors">{comp.ref_no}</div>
                        <div className="text-[9px] text-[#475569] font-bold uppercase mt-0.5 flex items-center gap-1">
                          <MapPin size={8} /> {comp.city || 'Unknown'}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-[12px] font-black text-white uppercase tracking-tight font-['Outfit',sans-serif]">
                          {comp.categories?.[0] || 'Unclassified'}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">{getSeverityBadge(comp.severity)}</td>
                      <td className="py-4 px-5">{getStatusBadge(comp.status)}</td>
                      <td className="py-4 px-5">
                        <div className="text-[11px] text-[#94A3B8] font-bold">{new Date(comp.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-5">
                        <Link to={`/admin/case/${comp.ref_no}`} className="text-cyan-dark text-[10px] font-black hover:underline uppercase tracking-widest">Triage Case</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ══════════ INTELLIGENCE GRID ══════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Incident Distribution */}
            <motion.div
              custom={9}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-[#0D1526] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden"
            >
              <h2 className="text-[8px] lg:text-[9px] font-black text-[#475569] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-dark rounded-full"></div> Intelligence Metrics
              </h2>
              <div className="flex flex-col gap-4">
                {insights.topCategories.map(([name, count], i) => {
                  const pct = insights.total > 0 ? Math.round((count / insights.total) * 100) : 0;
                  const colors = ['#00D4FF', '#8B5CF6', '#F59E0B', '#EF4444'];
                  return (
                    <div key={name} className="group/cat">
                      <div className="flex justify-between text-[9px] lg:text-[10px] font-black mb-1.5 uppercase tracking-tight">
                        <span className="text-[#E2E8F0] group-hover/cat:text-cyan-dark transition-colors truncate max-w-[140px]">{name}</span>
                        <span style={{ color: colors[i % colors.length] }}>{pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 3)}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors[i % colors.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Fraud Intelligence */}
            <motion.div
              custom={10}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-[#0D1526] border border-red-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden"
            >
              <h2 className="text-[8px] lg:text-[9px] font-black text-red-500/80 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> Neural Analytics
              </h2>
              {data.patterns && data.patterns.length > 0 ? (
                <div className="relative z-10">
                  <p className="text-[10px] lg:text-[11px] text-[#E2E8F0] leading-relaxed mb-4 font-medium opacity-80">
                    Detected <span className="text-red-500 font-bold">{data.patterns[0].complaint_count}</span> linked entities in SOC grid.
                  </p>
                  <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl mb-4">
                    <div className="text-[8px] text-red-400 font-black uppercase tracking-[0.2em] mb-1">Target Vector</div>
                    <div className="text-[10px] lg:text-xs font-black text-white font-mono truncate">{data.patterns[0].entity_value}</div>
                  </div>
                  <Link to="/fraud-network" className="w-full bg-white/5 border border-white/10 text-[#64748B] hover:text-white font-black text-[9px] tracking-[0.2em] uppercase py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all">
                    Neural Grid <ArrowUpRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="py-8 text-center text-[#475569] text-[9px] font-black uppercase tracking-widest">Scanning...</div>
              )}
            </motion.div>

            {/* Live Alerts */}
            <motion.div
              custom={11}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-[#0D1526] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden md:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[8px] lg:text-[9px] font-black text-[#475569] uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div> SOC Broadcast
                </h2>
                <Link to="/admin/alerts" className="text-[8px] lg:text-[9px] font-black text-cyan-dark hover:text-cyan-400 uppercase">Manage</Link>
              </div>
              <div className="space-y-2.5">
                {alerts.slice(0, 3).map(alert => (
                  <div key={alert._id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-tight truncate">{alert.title}</h3>
                      <span className={`w-1 h-1 rounded-full ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-cyan-dark'}`}></span>
                    </div>
                    <div className="text-[7px] lg:text-[8px] text-[#475569] font-bold uppercase tracking-widest">{alert.scam_type}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ══════════ NEURAL THREAT MATRIX ══════════ */}
          <motion.div
            custom={12}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-[#0B1221] border border-white/10 rounded-2xl lg:rounded-[2.5rem] p-5 lg:p-8 shadow-3xl relative overflow-hidden mb-8 min-h-[600px] lg:min-h-[700px]"
          >
            {/* Background ambient sync */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 mb-8 lg:mb-12 relative z-10">
              <div className="flex items-center gap-4 lg:gap-5">
                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-cyan-dark/10 border border-cyan-dark/30 flex items-center justify-center animate-pulse">
                  <Radio size={20} className="lg:hidden text-cyan-dark" />
                  <Radio size={24} className="hidden lg:block text-cyan-dark" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-2xl font-black text-white uppercase tracking-tight font-['Outfit',sans-serif]">Neural Threat Matrix</h2>
                  <div className="flex items-center gap-2 lg:gap-3 mt-0.5">
                    <span className="text-[8px] lg:text-[10px] text-cyan-dark font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Activity size={10} /> Live Ops System
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                <div className="bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-4 flex justify-around sm:justify-start gap-6 lg:gap-8 items-center backdrop-blur-md">
                  {[
                    { label: 'Load', val: scanning ? '98%' : '42%', color: scanning ? 'text-red-500' : 'text-cyan-dark' },
                    { label: 'Node', val: '0x3F2', color: 'text-emerald-500' },
                    { label: 'Lat', val: '4ms', color: 'text-amber-500' },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className={`text-xs lg:text-base font-black ${stat.color} tabular-nums mb-0.5`}>{stat.val}</div>
                      <div className="text-[7px] lg:text-[8px] text-[#475569] font-black uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleGlobalScan}
                  disabled={scanning || refreshing}
                  className="bg-cyan-dark text-dark-bg-sidebar px-6 py-4 rounded-xl lg:rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 transition shadow-lg shadow-cyan-dark/20 disabled:opacity-50"
                >
                  {scanning ? 'Syncing...' : 'Execute Neural Scan'}
                </button>
              </div>
            </div>

            {/* Grid Container */}
            <div className="flex flex-col lg:flex-row gap-8 relative z-10 h-full">
              
              {/* Tactical Log */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="bg-black/40 border border-white/5 rounded-2xl lg:rounded-3xl p-5 lg:p-6 flex flex-col min-h-[300px] lg:h-[500px]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[8px] lg:text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] flex items-center gap-2">
                       Tactical Log <span className="w-1.5 h-1.5 rounded-full bg-cyan-dark animate-pulse"></span>
                    </h3>
                  </div>
                  
                  <div className="space-y-3.5 font-mono overflow-y-auto pr-2 scrollbar-hide flex-1">
                    {tacticalLogs.map((log, i) => (
                      <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className="text-[8px] lg:text-[10px] flex gap-3 border-l border-white/5 pl-3 py-1">
                        <span className="text-[#475569] shrink-0 font-bold">{log.t}</span>
                        <span className={`grow leading-tight ${log.c || 'text-[#94A3B8]'}`}>{log.msg}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="w-full h-8 relative opacity-30">
                       <svg viewBox="0 0 100 20" className="w-full h-full text-cyan-dark fill-none">
                          <motion.path d="M0 10 L10 10 L15 0 L25 20 L30 10 L40 10 L100 10" stroke="currentColor" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} />
                       </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intel Nodes Grid */}
              <div className="w-full lg:w-2/3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                  {data.complaints.slice(0, 6).map((comp, idx) => {
                    const sevColor = comp.severity === 'Critical' ? '#EF4444' : comp.severity === 'High' ? '#F59E0B' : '#00D4FF';
                    return (
                      <Link key={comp._id} to={`/admin/case/${comp.ref_no}`} className="group bg-white/[0.02] border border-white/5 rounded-2xl lg:rounded-3xl p-5 lg:p-6 hover:border-cyan-dark/30 transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 flex items-center justify-center font-mono text-[8px] lg:text-[10px] font-black text-[#475569] border border-white/10 grayscale group-hover:grayscale-0 transition-all">
                              N_{idx + 1}
                            </div>
                            <div>
                              <div className="text-[9px] font-black font-mono text-cyan-dark/60">{comp.ref_no}</div>
                              <h4 className="text-xs lg:text-sm font-black text-white uppercase tracking-tight line-clamp-1">{comp.categories?.[0]}</h4>
                            </div>
                          </div>
                          <div className={`p-1.5 rounded-lg border`} style={{ backgroundColor: `${sevColor}10`, borderColor: `${sevColor}30` }}>
                             <Zap size={12} style={{ color: sevColor }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="text-[8px] lg:text-[9px] text-[#475569] font-black uppercase tracking-widest">{comp.city}</div>
                          <div className="text-[8px] lg:text-[9px] font-black text-cyan-dark uppercase tracking-[0.2em] flex items-center gap-1">
                            Link <ArrowUpRight size={10} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

