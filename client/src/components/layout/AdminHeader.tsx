import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Bell, Clock, RefreshCw, User as UserIcon, LogOut, 
  Settings, Activity, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile, getActiveAlerts } from '../../lib/api';
import { removeToken } from '../../lib/auth';
import { User } from '../../types';

export const AdminHeader = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    fetchProfile();
    fetchNotifications();
    return () => clearInterval(timer);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch admin profile');
    }
  };

  const fetchNotifications = async () => {
    // In a real app, this would be a notifications API
    // For now, using active alerts + some mock ones
    try {
      const res = await getActiveAlerts();
      const mockNotifs = [
        { id: 'n1', title: 'System Heartbeat', type: 'info', desc: 'Neural nodes synchronization complete.', time: 'Just now' },
        { id: 'n2', title: 'Intelligence Update', type: 'high', desc: 'New phishing pattern identified in Mumbai.', time: '12m ago' }
      ];
      setNotifications([...mockNotifs, ...res.data.map(a => ({ 
        id: a._id, 
        title: a.title, 
        type: a.severity === 'Critical' ? 'critical' : 'high', 
        desc: a.description, 
        time: 'Active' 
      }))]);
    } catch (err) {
      setNotifications([]);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/admin/login');
  };

  return (
    <header className="h-20 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      {/* Left: Branding & Page Title */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-dark/20 to-indigo-500/20 flex items-center justify-center border border-cyan-dark/30 shadow-[0_0_20px_rgba(34,211,238,0.15)] group cursor-pointer hover:scale-105 transition-all">
            <Shield size={22} className="text-cyan-dark animate-[pulse_3s_infinite]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-white uppercase tracking-tight font-['Outfit',sans-serif]">SOC Command</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
              <span className="text-[9px] text-[#64748B] font-black uppercase tracking-[0.2em]">Node-01 Online</span>
            </div>
          </div>
        </div>
        
        <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>
        
        <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-4 py-2 backdrop-blur-md">
           <Clock size={14} className="text-cyan-dark" />
           <span className="font-mono text-sm font-bold text-white tabular-nums tracking-tighter">
             {clock.toLocaleTimeString('en-IN', { hour12: false })}
           </span>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* All Systems Status */}
        <div className="hidden md:flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-full px-4 py-1.5 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]">
           <Zap size={14} className="text-emerald-500" fill="currentColor" />
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Grid Synchronized</span>
        </div>

        {/* Global Search/Refresh */}
        <button 
           onClick={() => window.location.reload()}
           className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#64748B] hover:text-white hover:bg-white/10 transition-all group"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>

        {/* Notifications Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className={`relative w-10 h-10 rounded-xl border transition-all flex items-center justify-center overflow-hidden ${
              showNotifications 
                ? 'bg-cyan-dark/10 border-cyan-dark text-cyan-dark shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                : 'bg-white/5 border-white/10 text-[#64748B] hover:text-white hover:bg-white/10'
            }`}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] flex items-center justify-center text-[8px] font-black text-white px-1 border-2 border-[#0A0F1E] animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-14 right-0 w-80 md:w-96 bg-[#0D1526]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] overflow-hidden"
              >
                <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center bg-gradient-to-r from-cyan-dark/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-cyan-dark" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Neural Alert Queue</h3>
                  </div>
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[10px] font-black text-cyan-dark hover:text-white transition-colors uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border border-cyan-dark/30 hover:bg-cyan-dark/20 transition-all"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group flex gap-4">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_currentColor] ${
                        n.type === 'critical' ? 'text-red-500 bg-red-500' : 
                        n.type === 'high' ? 'text-amber-500 bg-amber-500' : 'text-cyan-dark bg-cyan-dark'
                      }`}></div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-cyan-dark transition-colors">{n.title}</h4>
                          <span className="text-[9px] text-[#475569] font-bold">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-[#94A3B8] leading-relaxed line-clamp-2">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                       <Shield size={32} className="text-[#1E293B]" />
                       <p className="text-[10px] text-[#475569] font-black uppercase tracking-[0.2em]">Zero Threats Detected</p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/5 text-center">
                   <button className="text-[10px] font-black text-cyan-dark hover:text-white transition-colors uppercase tracking-[0.2em]">Audit All Operations</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Profile Section */}
        <div className="relative pl-6 border-l border-white/10 h-10 flex items-center">
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block overflow-hidden max-w-[150px]">
              <div className="text-xs font-black text-white group-hover:text-cyan-dark transition-colors truncate uppercase tracking-tight">
                {profile?.name || 'Loading...'}
              </div>
              <div className="text-[9px] text-[#64748B] font-black tracking-[0.1em] uppercase">
                {profile?.rank || 'SOC Agent'}
              </div>
            </div>
            
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 p-[1px] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
              <div className="w-full h-full rounded-2xl bg-[#0D1526] overflow-hidden border border-white/5 flex items-center justify-center">
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} className="text-[#64748B] group-hover:text-cyan-dark transition-colors" />
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-14 right-0 w-64 bg-[#0D1526]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] overflow-hidden p-2"
              >
                <div className="p-4 border-b border-white/5 mb-2">
                  <div className="text-[10px] font-black text-cyan-dark uppercase tracking-[0.2em] mb-3">Identity Verified</div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                        <Shield size={14} className="text-[#64748B]" />
                     </div>
                     <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{profile?.email}</div>
                        <div className="text-[9px] text-[#475569] font-bold uppercase">{profile?.badge_id || 'ID_PENDING'}</div>
                     </div>
                  </div>
                </div>

                <Link 
                  to="/admin/profile" 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest group"
                >
                  <UserIcon size={16} className="text-[#475569] group-hover:text-cyan-dark transition-colors" />
                  Bureau Profile
                </Link>
                <Link 
                  to="/admin/settings" 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest group"
                >
                  <Settings size={16} className="text-[#475569] group-hover:text-cyan-dark transition-colors" />
                  SOC Settings
                </Link>
                
                <div className="my-2 border-t border-white/5"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black text-red-400 hover:text-white hover:bg-red-500/20 transition-all uppercase tracking-widest group"
                >
                  <LogOut size={16} className="text-red-500/50 group-hover:text-red-500 transition-colors" />
                  Terminate Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
