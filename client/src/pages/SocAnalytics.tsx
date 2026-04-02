import React, { useEffect, useState, useMemo } from 'react';
import { getAnalytics, getDashboard } from '../lib/api';
import { AnalyticsData, DashboardData, CaseStatus } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, PieChart, Pie, RadialBarChart, RadialBar,
  ComposedChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Activity, MapPin,
  BarChart2, Shield, Folder, CheckCircle, Clock, Zap,
  ArrowUpRight, ArrowDownRight, Eye, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageLoader } from '../components/shared/PageLoader';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
  })
};

const SEVERITY_COLORS: Record<string, string> = {
  'Critical': '#EF4444',
  'High': '#F59E0B',
  'Medium': '#3B82F6',
  'Low': '#10B981'
};

export const SocAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    try {
      setRefreshing(true);
      const [analyticsRes, dashRes] = await Promise.all([
        getAnalytics(),
        getDashboard()
      ]);
      setData(analyticsRes.data);
      setDashData(dashRes.data);
      setError('');
    } catch (err: any) {
      console.error('Analytics Fetch Error:', err);
      setError(err.response?.data?.error || 'Failed to connect to intelligence nodes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const computedMetrics = useMemo(() => {
    if (!data || !dashData) return null;

    const totalComplaints = data.categories.reduce((sum, c) => sum + c.count, 0);
    const resolved = dashData.stats.resolved;
    const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;
    const pending = totalComplaints - resolved;

    const statusCounts = dashData.complaints.reduce((acc: Record<CaseStatus, number>, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, { RECEIVED: 0, ASSIGNED: 0, UNDER_INVESTIGATION: 0, RESOLVED: 0 });

    const avgCategories = totalComplaints > 0 ? (data.categories.length / (dashData.complaints.length || 1)).toFixed(1) : '0';
    const peakMonth = [...data.monthly].sort((a, b) => b.count - a.count)[0] || { month: '-', count: 0 };
    const topCity = [...data.cities].sort((a, b) => b.count - a.count)[0] || { city: '-', count: 0 };
    const severityTotal = data.severity.reduce((sum, s) => sum + s.count, 0);

    return {
      totalComplaints, resolved, resolutionRate, pending,
      statusCounts, avgCategories, peakMonth, topCity, severityTotal
    };
  }, [data, dashData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F172A] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[11px] text-[#94A3B8] font-black uppercase tracking-widest mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
              <span className="text-xs font-black text-white">{entry.name}: <span className="text-[#00D4FF]">{entry.value}</span></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0A0F1E]"><PageLoader /></div>;

  if (error || !data || !dashData || !computedMetrics) return (
    <div className="h-screen flex items-center justify-center bg-[#0A0F1E] text-red-500 flex-col gap-4">
      <AlertTriangle size={48} />
      <p className="font-medium">{error || 'Failed to load analytics data.'}</p>
      <button onClick={fetchAll} className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs">Retry Connection</button>
    </div>
  );

  const gaugeData = [{ name: 'Resolved', value: computedMetrics.resolutionRate, fill: '#10B981' }];
  const statusData = [
    { name: 'RECEIVED', icon: Folder, color: '#64748B', label: 'Queued' },
    { name: 'ASSIGNED', icon: Clock, color: '#3B82F6', label: 'Allocated' },
    { name: 'UNDER_INVESTIGATION', icon: Activity, color: '#8B5CF6', label: 'Active' },
    { name: 'RESOLVED', icon: CheckCircle, color: '#10B981', label: 'Finalized' }
  ];

  return (
    <div className="w-full relative px-2 sm:px-0">
      <div className="flex flex-col gap-6 lg:gap-8">
        
        {/* STAT CARDS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {[
            { label: 'Total FIRs', value: computedMetrics.totalComplaints, icon: Shield, color: '#00D4FF', accent: 'border-b-cyan-dark' },
            { label: 'Critical', value: dashData.stats.critical, icon: AlertTriangle, color: '#EF4444', accent: 'border-b-red-500' },
            { label: 'High Priority', value: dashData.stats.high, icon: Zap, color: '#F59E0B', accent: 'border-b-amber-500' },
            { label: 'Resolved', value: computedMetrics.resolved, icon: CheckCircle, color: '#10B981', accent: 'border-b-emerald-500' },
            { label: 'In Progress', value: computedMetrics.pending, icon: Clock, color: '#3B82F6', accent: 'border-b-blue-500' },
            { label: 'Trend', value: `${data.trend}%`, icon: refreshing ? RefreshCw : (data.trend >= 0 ? TrendingUp : TrendingDown), color: data.trend >= 0 ? '#10B981' : '#EF4444', accent: data.trend >= 0 ? 'border-b-emerald-500' : 'border-b-red-500' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className={`bg-[#0D1526] border border-white/5 border-b-2 ${stat.accent} rounded-xl p-4 lg:p-5 shadow-lg group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between mb-2">
                <stat.icon size={16} style={{ color: stat.color }} className={stat.label === 'Trend' && refreshing ? 'animate-spin' : ''} />
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* ROW 1: TRENDS + SEVERITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Trend Chart */}
          <motion.div
            custom={6}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-8 bg-[#0D1526] border border-white/5 rounded-2xl p-5 lg:p-6 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-dark/10 flex items-center justify-center border border-cyan-dark/20">
                  <Activity size={18} className="text-cyan-dark" />
                </div>
                <div>
                  <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-wider">FIR Filing Trend</h2>
                  <p className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Timeline analysis</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#475569]">
                Peak: {computedMetrics.peakMonth.month} ({computedMetrics.peakMonth.count})
              </div>
            </div>

            <div className="h-64 lg:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickMargin={12} 
                    axisLine={false} 
                    tickLine={false}
                    interval={data.monthly.length > 7 ? 'preserveStartEnd' : 0}
                  />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="none" fill="url(#areaGrad)" />
                  <Line type="monotone" dataKey="count" stroke="#00D4FF" strokeWidth={3} dot={{ r: 4, fill: '#0A0F1E', stroke: '#00D4FF', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00D4FF', stroke: '#0A0F1E', strokeWidth: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Severity Breakdown */}
          <motion.div
            custom={7}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-4 bg-[#0D1526] border border-white/5 rounded-2xl p-5 lg:p-6 shadow-xl flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-wider">Threat Breakdown</h2>
                <p className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Severity intelligence</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:gap-5 flex-1 justify-center">
              {data.severity.map((s, i) => {
                const pct = computedMetrics.severityTotal > 0 ? Math.round((s.count / computedMetrics.severityTotal) * 100) : 0;
                const color = SEVERITY_COLORS[s.level] || '#64748B';
                return (
                  <div key={s.level}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }}></span>
                        <span className="text-[10px] lg:text-xs font-bold text-[#E2E8F0] uppercase tracking-wide">{s.level}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-white">{s.count}</span>
                        <span className="text-[9px] lg:text-[10px] font-bold text-[#64748B] w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 lg:h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 2)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-between items-center">
              <span className="text-[9px] lg:text-[10px] font-black text-[#64748B] uppercase tracking-widest">Total Classified</span>
              <span className="text-base lg:text-lg font-black text-white tabular-nums">{computedMetrics.severityTotal}</span>
            </div>
          </motion.div>
        </div>

        {/* ROW 2: CATEGORIES + RESOLUTION GAUGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Top Crime Categories */}
          <motion.div
            custom={8}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-12 xl:col-span-5 bg-[#0D1526] border border-white/5 rounded-2xl p-5 lg:p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <BarChart2 size={18} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-wider">Crime Categories</h2>
                  <p className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Incident hotspots</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-4 lg:gap-4">
              {data.categories.slice(0, 6).map((cat, i) => {
                const maxCount = data.categories[0]?.count || 1;
                const pct = Math.round((cat.count / maxCount) * 100);
                const colors = ['#00D4FF', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'];
                const color = colors[i % colors.length];
                return (
                  <div key={cat.name} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] lg:text-[11px] font-bold text-[#E2E8F0] uppercase tracking-tight truncate max-w-[160px] lg:max-w-[200px] group-hover:text-white transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-xs font-mono font-black tabular-nums" style={{ color }}>{cat.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color, opacity: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Resolution Gauge */}
          <motion.div
            custom={9}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-6 xl:col-span-3 bg-[#0D1526] border border-white/5 rounded-2xl p-5 lg:p-6 shadow-xl flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-full flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle size={18} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-wider">Resolution</h2>
                <p className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Efficiency rate</p>
              </div>
            </div>

            <div className="relative w-40 h-40 lg:w-48 lg:h-48 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="75%" outerRadius="100%"
                  startAngle={90} endAngle={-270}
                  data={gaugeData}
                  barSize={12}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl lg:text-4xl font-black text-white tabular-nums tracking-tighter">{computedMetrics.resolutionRate}%</span>
                <span className="text-[8px] lg:text-[9px] text-[#64748B] font-black uppercase tracking-widest mt-1">Success</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
              <div className="text-center">
                <div className="text-base lg:text-lg font-black text-emerald-500 tabular-nums">{computedMetrics.resolved}</div>
                <div className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest">Closed</div>
              </div>
              <div className="text-center">
                <div className="text-base lg:text-lg font-black text-amber-500 tabular-nums">{computedMetrics.pending}</div>
                <div className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest">Open</div>
              </div>
            </div>
          </motion.div>

          {/* Investigation Pipeline */}
          <motion.div
            custom={10}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-6 xl:col-span-4 bg-[#0D1526] border border-white/5 rounded-2xl p-5 lg:p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Activity size={18} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-wider">Case Pipeline</h2>
                <p className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Workflow stages</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:gap-5">
              {statusData.map((status, i) => (
                <div key={status.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                      <status.icon size={14} style={{ color: status.color }} />
                    </div>
                    <span className="text-[10px] lg:text-xs font-bold text-[#E2E8F0] uppercase tracking-wide">{status.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block w-24 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(computedMetrics.statusCounts[status.name] / computedMetrics.totalComplaints) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: status.color, opacity: 0.6 }}
                      />
                    </div>
                    <span className="text-sm font-mono font-black text-white w-8 text-right">{computedMetrics.statusCounts[status.name]}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ROW 3: GEOGRAPHICAL HOTSPOTS (FULL WIDTH) */}
        <motion.div
          custom={11}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-[#0D1526] border border-white/5 rounded-2xl p-5 lg:p-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <MapPin size={18} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-wider">Geographical Hotspots</h2>
                <p className="text-[8px] lg:text-[9px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Top reporting hubs</p>
              </div>
            </div>
            {computedMetrics.topCity.city !== '-' && (
              <div className="text-[9px] lg:text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest text-center">
                Highest Node: {computedMetrics.topCity.city}
              </div>
            )}
          </div>

          <div className="h-60 lg:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cities} margin={{ top: 10, right: 0, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis 
                  dataKey="city" 
                  stroke="#475569" 
                  fontSize={9} 
                  axisLine={false} 
                  tickLine={false}
                  tickMargin={8}
                  interval={data.cities.length > 5 ? 'preserveStartEnd' : 0}
                />
                <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.cities.map((_, i) => (
                    <Cell key={`city-${i}`} fill={i === 0 ? '#10B981' : `rgba(16, 185, 129, ${Math.max(0.3, 1 - i * 0.12)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* FOOTER INSIGHTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Avg Classifications', value: computedMetrics.avgCategories, sub: 'per FIR', icon: BarChart2, color: 'text-cyan-dark', bg: 'bg-cyan-dark/10', border: 'border-cyan-dark/20' },
            { label: 'Peak Activity', value: computedMetrics.peakMonth.month, sub: `${computedMetrics.peakMonth.count} FIRs`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: 'Top Hotspot', value: computedMetrics.topCity.city, sub: `${computedMetrics.topCity.count} reports`, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              custom={12 + i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-[#0D1526] border border-white/5 rounded-xl lg:rounded-2xl p-4 lg:p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${item.bg} flex items-center justify-center border ${item.border} shrink-0`}>
                <item.icon size={20} className={item.color} />
              </div>
              <div>
                <div className="text-[8px] lg:text-[9px] text-[#64748B] font-black uppercase tracking-widest">{item.label}</div>
                <div className="text-lg lg:text-xl font-black text-white tracking-tighter">
                  {item.value} <span className="text-[10px] font-bold text-[#64748B]">{item.sub}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
