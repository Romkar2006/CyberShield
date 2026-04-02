import React, { useState, useEffect } from 'react';
import { 
  User, Shield, BadgeCheck, Briefcase, Mail, Phone, 
  Calendar, Award, Save, Edit2, LogOut, Camera, 
  ChevronRight, Activity, Lock, Globe, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile, updateUserProfile } from '../lib/api';
import { removeToken } from '../lib/auth';
import { PageLoader } from '../components/shared/PageLoader';

export const AdminProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await updateUserProfile(formData);
      setProfile(formData);
      setIsEditing(false);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><PageLoader /></div>;

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 md:px-0">
      
      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-gradient-to-r from-cyan-dark/5 to-transparent p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-dark/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/30 to-purple-600/30 p-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <div className="w-full h-full rounded-[2.5rem] bg-[#0D1526] overflow-hidden border border-white/5 flex items-center justify-center relative">
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-[#1E293B]" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-cyan-dark p-2 rounded-xl shadow-lg border-2 border-[#0A0F1E] animate-bounce">
              <BadgeCheck size={18} className="text-[#0A0F1E]" />
            </div>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-[10px] font-black text-cyan-dark bg-cyan-dark/10 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-dark/20">Active Duty</span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-400/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Verified Inspector
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter font-['Outfit',sans-serif] mb-1">
              {profile?.name}
            </h1>
            <p className="text-lg font-bold text-[#64748B] uppercase tracking-[0.2em]">{profile?.rank} • {profile?.department}</p>
          </div>
        </div>

        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-cyan-dark text-[#0A0F1E] font-black text-[11px] uppercase tracking-widest hover:brightness-110 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                Lock Intelligence
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[#64748B] hover:text-white hover:border-cyan-dark/50 font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
              <Edit2 size={14} className="group-hover:text-cyan-dark transition-colors" />
              Modify Identity
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Profile Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core Info */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-[#0D1526] border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-8">
                <Shield size={20} className="text-cyan-dark" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Bureau Intelligence Credentials</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Legally Assigned Name</label>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.name || ''} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-cyan-dark transition-all disabled:opacity-60 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Police Rank / Grade</label>
                    <select 
                      disabled={!isEditing}
                      value={formData.rank || ''} 
                      onChange={(e) => setFormData({...formData, rank: e.target.value})}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-cyan-dark transition-all disabled:opacity-60 appearance-none"
                    >
                      <option>Inspector</option>
                      <option>Assistant Commissioner (ACP)</option>
                      <option>Deputy Commissioner (DCP)</option>
                      <option>Commissioner</option>
                      <option>Cyber Intelligence Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Badge / Officer ID</label>
                    <div className="relative">
                      <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569]" />
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={formData.badge_id || ''} 
                        onChange={(e) => setFormData({...formData, badge_id: e.target.value})}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-cyan-dark transition-all disabled:opacity-60 font-mono tracking-tighter"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Unit / Department</label>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.department || ''} 
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-cyan-dark transition-all disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Core Area of Expertise</label>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.specialization || ''} 
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-cyan-dark transition-all disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Years of Intelligence Ops</label>
                    <input 
                      type="number" 
                      disabled={!isEditing}
                      value={formData.years_of_service || 0} 
                      onChange={(e) => setFormData({...formData, years_of_service: parseInt(e.target.value)})}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-cyan-dark transition-all disabled:opacity-60 tabular-nums"
                    />
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-[#0D1526] border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-8">
                <Globe size={20} className="text-cyan-dark" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Contact & Communication</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Official Email Address</label>
                  <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-bold text-[#64748B] flex items-center justify-between">
                    {profile?.email}
                    <Lock size={12} className="opacity-40" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3 block">Mobile / Critical Comms</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.phone || ''} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-cyan-dark transition-all disabled:opacity-60 tabular-nums"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Cards & Status */}
        <div className="space-y-8">

           {/* ── Dynamic Achievements Section ── */}
           <div className="bg-[#0D1526] border border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                <Award size={120} />
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <Award size={20} className="text-violet-500" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Bureau Decorations</h3>
                </div>
                <span className="text-[10px] font-black text-[#64748B] hover:text-cyan-dark cursor-pointer transition-colors uppercase tracking-widest">View All</span>
              </div>

              <div className="space-y-6 relative z-10">
                {(profile?.achievements && profile.achievements.length > 0 ? profile.achievements : [
                  { 
                    title: 'Cyber Specialist V', 
                    description: 'Resolved 50+ Critical Ransomware cases', 
                    date: 'March 24, 2026', 
                    time: '14:30 IST',
                    icon_type: 'Shield'
                  },
                  { 
                    title: 'Swift Justice Medal', 
                    description: 'Average FIR generation < 10 seconds', 
                    date: 'Feb 12, 2026', 
                    time: '09:15 IST',
                    icon_type: 'BadgeCheck'
                  }
                ]).map((ach: any, idx: number) => {
                  const IconMap: any = { Shield, BadgeCheck, Lock, Award, Activity };
                  const AchievementIcon = IconMap[ach.icon_type] || Award;
                  
                  return (
                  <div key={idx} className="group relative pl-6 border-l-2 border-white/5 hover:border-violet-500/50 transition-all duration-300">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0D1526] border-2 border-white/10 group-hover:border-violet-500 transition-colors"></div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-white uppercase tracking-wider">{ach.title}</span>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-[#475569] uppercase tabular-nums">
                          <Calendar size={10} /> {ach.date}
                        </div>
                      </div>
                      <p className="text-[10px] font-medium text-[#64748B] mb-2">{ach.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#475569] uppercase tracking-tighter">Verified at {ach.time}</span>
                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center border border-white/5">
                          <AchievementIcon size={12} className="text-violet-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
           </div>

           {/* ── Operational Performance Pulse (Functional) ── */}
           <div className="bg-[#0D1526] border border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00D4FF_1px,transparent_1px)] bg-[size:20px:20px]"></div>
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-cyan-dark/10 flex items-center justify-center border border-cyan-dark/20">
                  <Activity size={20} className="text-cyan-dark" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Operational Pulse</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="text-[9px] font-black text-[#475569] mb-1 uppercase tracking-widest group-hover:text-cyan-dark">Active Workload</div>
                  <div className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                    {profile?.performance_stats?.active_workload || 0} <span className="text-[10px] text-cyan-dark">Cases</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="text-[9px] font-black text-[#475569] mb-1 uppercase tracking-widest group-hover:text-emerald-500">Avg. Response</div>
                  <div className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                    {profile?.performance_stats?.avg_response_time || 0} <span className="text-[10px] text-emerald-500">m</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Intelligence Accuracy', val: profile?.performance_stats?.intelligence_accuracy || 0, color: 'bg-violet-600' },
                  { label: 'Resolution Rate', val: profile?.performance_stats?.resolution_rate || 0, color: 'bg-emerald-500' },
                  { label: 'System Uptime', val: profile?.performance_stats?.system_uptime || 100, color: 'bg-cyan-dark' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">{stat.label}</span>
                       <span className="text-[10px] font-black text-white tabular-nums">{stat.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.val}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${stat.color} shadow-[0_0_10px_rgba(34,211,238,0.2)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 bg-amber-500 rounded-full ${profile?.performance_stats?.critical_escalations > 0 ? 'animate-ping' : ''}`}></div>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                    {profile?.performance_stats?.critical_escalations || 0} Critical Escalations
                  </span>
                </div>
                <ChevronRight size={14} className="text-amber-500" />
              </div>
           </div>

           <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8">
              <button 
                onClick={() => { removeToken(); window.location.href = '/admin/login'; }}
                className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-5 rounded-3xl font-black text-[11px] tracking-widest uppercase transition-all shadow-lg group"
              >
                <LogOut size={18} className="group-hover:rotate-180 transition-transform" />
                Terminate System Access
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
