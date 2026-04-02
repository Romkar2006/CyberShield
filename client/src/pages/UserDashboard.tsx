import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, FileText, Search, PhoneCall, BookOpen, ShieldCheck, Plus, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserName, removeUserAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { getMyCases, getActiveAlerts } from '../lib/api';
import { Complaint, ScamAlert } from '../types';

export const UserDashboard = () => {
  const navigate = useNavigate();
  const userName = getUserName();
  const firstName = userName.split(' ')[0];

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Complaint[]>([]);
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, alertsRes] = await Promise.all([
          getMyCases(),
          getActiveAlerts()
        ]);
        setCases(casesRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    removeUserAuth();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-[#0A0F1E] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCasesCount = cases.filter(c => c.status !== 'RESOLVED').length;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#0A0F1E] font-sans text-white py-10 px-6 md:px-12 relative overflow-x-hidden">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white tracking-tight mb-2"
          >
            Welcome back, {firstName}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#94A3B8] text-sm font-medium"
          >
            You have <span className="font-bold text-[#00D4FF]">{activeCasesCount} active cases</span> that require your attention. Your security is our priority.
          </motion.p>
        </div>
        
        <motion.button 
          onClick={() => navigate('/complaint')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#00D4FF] hover:bg-[#00b3d6] text-[#0A0F1E] px-6 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-colors shadow-lg shadow-[#00D4FF]/20"
        >
          File a new complaint <ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Double Column (Cases & Quick Actions) */}
        <div className="lg:col-span-2 flex flex-col gap-12">
          
          {/* Active Cases Section */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-white">Active Cases Summary</h2>
              <button onClick={() => navigate('/my-complaints')} className="text-[13px] font-bold text-[#00D4FF] hover:underline">View all cases</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cases.length === 0 ? (
                <div className="col-span-1 md:col-span-2 p-10 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-[#64748B] text-center">
                  <FileText size={40} className="mb-3 opacity-20" />
                  <p className="text-sm">No cases filed yet. Ready to secure your digital footprint?</p>
                </div>
              ) : cases.slice(0, 2).map((c, idx) => (
                <motion.div 
                  key={c.ref_no}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/track/${c.ref_no}`)}
                  className={`bg-[#0D1526] border border-white/[0.04] rounded-3xl p-6 shadow-lg shadow-black/20 border-l-4 cursor-pointer transition-all ${
                    c.severity === 'Critical' ? 'border-l-red-500' : c.severity === 'High' ? 'border-l-orange-500' : 'border-l-emerald-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase">REF: {c.ref_no}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      c.severity === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-[#00D4FF]/10 text-[#00D4FF]'
                    }`}>{c.severity}</span>
                  </div>
                  <h3 className="text-[19px] font-bold text-white mb-1 truncate">{c.categories[0]}</h3>
                  <p className="text-xs font-semibold text-[#64748B] mb-6">Reported {new Date(c.createdAt).toLocaleDateString()} • {c.department}</p>
                  
                  <div className="flex items-center gap-2 text-[#00D4FF] text-[13px] font-bold">
                    Track Progress <ArrowRight size={14} strokeWidth={3} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quick Actions Section */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              
              <motion.button onClick={() => navigate('/complaint')} whileHover={{ scale: 1.02 }} className="bg-[#0D1526] hover:bg-white/5 border border-white/[0.04] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square transition-all shadow-lg shadow-black/20">
                <div className="w-14 h-14 bg-[#00D4FF]/20 text-[#00D4FF] rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                  <FileText size={24} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">New Complaint</span>
              </motion.button>

              <motion.button onClick={() => navigate('/status')} whileHover={{ scale: 1.02 }} className="bg-[#0D1526] hover:bg-white/5 border border-white/[0.04] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square transition-all shadow-lg shadow-black/20">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                  <Search size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">Track Case</span>
              </motion.button>

              <motion.button onClick={() => navigate('/helplines')} whileHover={{ scale: 1.02 }} className="bg-[#0D1526] hover:bg-white/5 border border-white/[0.04] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square transition-all shadow-lg shadow-black/20">
                <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center shadow-inner">
                  <PhoneCall size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">Helplines</span>
              </motion.button>

              <motion.button onClick={() => navigate('/hub')} whileHover={{ scale: 1.02 }} className="bg-[#0D1526] hover:bg-white/5 border border-white/[0.04] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 aspect-square transition-all shadow-lg shadow-black/20">
                <div className="w-14 h-14 bg-white/10 text-white/70 rounded-2xl flex items-center justify-center shadow-inner">
                  <BookOpen size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase">Knowledge</span>
              </motion.button>

            </div>
          </section>

        </div>

        {/* Right Single Column (Alerts & Tips) */}
        <div className="flex flex-col gap-6">
          
          {/* Active Scam Alert Widget */}
          {alerts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0D1526] border border-[#00D4FF]/20 rounded-[2rem] p-8 shadow-xl shadow-[#00D4FF]/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex items-center gap-2 mb-5 relative">
                <AlertTriangle size={16} className="text-[#00D4FF]" strokeWidth={3} />
                <span className="text-[10px] font-black text-[#00D4FF] uppercase tracking-[0.2em]">Active Scam Alert</span>
              </div>
              
              <h3 className="text-[22px] font-extrabold text-white leading-tight mb-4 relative line-clamp-2">
                {alerts[0].title}
              </h3>
              
              <p className="text-[#94A3B8] text-[13px] font-medium leading-relaxed mb-8 relative line-clamp-3">
                {alerts[0].description}
              </p>

              <button onClick={() => navigate('/hub')} className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 text-[#00D4FF] text-[11px] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors relative">
                View Details <ExternalLink size={14} strokeWidth={2.5} />
              </button>
            </motion.div>
          ) : (
             <div className="bg-[#0D1526] rounded-[2rem] p-8 border border-white/[0.04] text-[#64748B] text-center italic text-sm">
                No active scam alerts in your region. Protecting you 24/7.
             </div>
          )}

          {/* Safety Tip Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0D1526] border border-white/[0.04] rounded-[2rem] p-8 shadow-lg shadow-black/20"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5">
              <ShieldCheck size={20} className="text-emerald-400" strokeWidth={3} />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-3">Safety Tip of the Day</h3>
            
            <p className="text-[#94A3B8] text-[13px] font-medium italic leading-relaxed mb-6">
              "Enable hardware-based 2FA (like YubiKey) for your primary email account to prevent 99% of automated account takeovers."
            </p>

            <button onClick={() => navigate('/hub')} className="text-[#00D4FF] hover:text-[#00b3d6] text-[11px] font-bold flex items-center gap-1 hover:underline">
              Learn more in Knowledge Hub <ArrowRight size={12} strokeWidth={3} />
            </button>
          </motion.div>

        </div>
      </div>

      {/* Latest News & Threat Intelligence Section */}
      <div className="max-w-7xl mx-auto mt-20 mb-16 px-2">
        <h2 className="text-2xl font-extrabold text-white mb-8 tracking-tight">Latest News & Threat Intelligence</h2>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Large Featured News Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="xl:col-span-2 bg-[#0D1526] border border-white/[0.04] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/40 group"
          >
            <div className="w-full md:w-[45%] h-64 md:h-auto overflow-hidden relative">
              <img 
                src="/cyber_news_1.png" 
                alt="Cyber Resilience" 
                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D1526]/40 to-transparent"></div>
            </div>
            <div className="flex-1 p-10 flex flex-col justify-center">
              <div className="text-[10px] font-black text-[#00D4FF] uppercase tracking-[0.3em] mb-4">New Policy</div>
              <h3 className="text-3xl font-extrabold text-white leading-tight mb-5">
                National Cyber Resilience Framework 2024
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">
                The Cyber Division has launched a robust new set of guidelines to protect private citizens against the rising tide of deepfake misinformation campaigns and AI-driven social engineering...
              </p>
              <button onClick={() => navigate('/hub')} className="text-[#00D4FF] font-bold text-sm flex items-center gap-2 group/link">
                Read the full release <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Smaller News Cards Column */}
          <div className="flex flex-col gap-6">
            
            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-[#0D1526] border border-white/[0.04] rounded-[2rem] p-8 shadow-xl shadow-black/20 flex flex-col justify-center group"
            >
              <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-3">Threat Alert</div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">E-Commerce Refund Scams on the Rise</h4>
              <p className="text-[#64748B] text-xs font-medium leading-relaxed mb-0">
                Coordinated scammers are posing as popular retailers to harvest credit card details through fake refund links.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-[#0D1526] border border-white/[0.04] rounded-[2rem] p-8 shadow-xl shadow-black/20 flex flex-col justify-center group"
            >
              <div className="text-[10px] font-black text-[#00D4FF] uppercase tracking-[0.3em] mb-3">Update</div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#00D4FF] transition-colors">Public Wi-Fi Safety Campaign</h4>
              <p className="text-[#64748B] text-xs font-medium leading-relaxed mb-0">
                New VPN subsidies are now available for students using university open networks to browse research portals.
              </p>
            </motion.div>

          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <button onClick={() => navigate('/complaint')} className="fixed bottom-8 right-8 w-14 h-14 bg-[#00D4FF] hover:bg-[#00b3d6] rounded-full flex items-center justify-center text-[#0A0F1E] shadow-lg shadow-[#00D4FF]/30 transition-transform hover:scale-105 z-50">
        <Plus size={28} strokeWidth={2.5} />
      </button>

    </div>
  );
};
