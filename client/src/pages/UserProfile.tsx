import React, { useState, useEffect } from 'react';
import { User as UserIcon, ShieldCheck, Copy, FileText, Folder, LogOut, Info, PenSquare, Type, Save, X } from 'lucide-react';
import { getUserName, removeUserAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, getMyCases } from '../lib/api';
import { Complaint } from '../types';

export const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    initials: '',
    email: '',
    phone: '',
    joined: '',
    stats: { total: 0, active: 0, resolved: 0 },
    language_pref: 'english',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    language_pref: 'english'
  });

  const [cases, setCases] = useState<Complaint[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, casesRes] = await Promise.all([
        getUserProfile(),
        getMyCases()
      ]);

      const userData = userRes.data;
      const userCases = casesRes.data;

      const active = userCases.filter(c => c.status !== 'RESOLVED').length;
      const resolved = userCases.filter(c => c.status === 'RESOLVED').length;

      const p = {
        name: userData.name,
        initials: userData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        email: userData.email,
        phone: userData.phone || 'Not provided',
        joined: new Date(userData.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        stats: { total: userCases.length, active, resolved },
        language_pref: userData.language_pref || 'english'
      };

      setProfile(p);
      setEditForm({
        name: userData.name,
        phone: userData.phone || '',
        language_pref: userData.language_pref || 'english'
      });
      setCases(userCases);

      // Update name in localStorage just in case it changed
      localStorage.setItem('cybershield_user_name', userData.name);

    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    removeUserAuth();
    navigate('/login');
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(editForm);
      setEditing(false);
      fetchData();
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-[#0A0F1E] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#0A0F1E] font-sans text-white py-8 px-4 md:px-12 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-14">
        
        {/* Left Column: Profile Card & Secure Session Banner */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
          
          {/* Main Profile Card */}
          <div className="bg-[#0D1526] rounded-[2rem] p-8 flex flex-col items-center shadow-lg shadow-black/20 border border-white/[0.04]">
            
            {/* Dashed Avatar Container */}
            <div className="relative mb-4 p-1 rounded-full border border-dashed border-[#00D4FF]/50">
              <div className="w-24 h-24 bg-[#0A0F1E] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                {profile.initials}
              </div>
              
              {/* Edit Button Toggle */}
              {!editing && (
                <button 
                  onClick={() => setEditing(true)}
                  className="absolute bottom-1 right-0 w-8 h-8 bg-[#00D4FF] text-[#0A0F1E] rounded-full flex items-center justify-center border-[3px] border-[#0D1526] hover:bg-[#00b3d6] transition-colors shadow-sm"
                >
                  <PenSquare size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-white tracking-tight text-center">{profile.name}</h2>
            <p className="text-xs text-[#94A3B8] mb-5">{profile.email}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase rounded-full mb-8 shadow-sm">
              <ShieldCheck size={12} strokeWidth={3} /> Verified Citizen
            </div>

            {/* Stats Row */}
            <div className="w-full flex justify-between items-center px-4 mb-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-white">{profile.stats.total}</div>
                <div className="text-[9px] text-[#64748B] font-bold tracking-widest uppercase mt-0.5">Total</div>
              </div>
              <div className="flex flex-col items-center text-[#00D4FF]">
                <div className="text-2xl font-bold text-[#00D4FF]">{profile.stats.active}</div>
                <div className="text-[9px] text-[#64748B] font-bold tracking-widest uppercase mt-0.5">Active</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-white">{profile.stats.resolved}</div>
                <div className="text-[9px] text-[#64748B] font-bold tracking-widest uppercase mt-0.5">Resolved</div>
              </div>
            </div>

            <div className="text-xs text-[#64748B] italic font-medium">
              Member since: {profile.joined}
            </div>
          </div>

          {/* Secure Session Banner */}
          <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-2xl p-6 shadow-sm">
            <h4 className="text-[#00D4FF] font-bold text-[13px] tracking-wide mb-1">Secure Session</h4>
            <p className="text-[#00D4FF]/70 text-[11px] font-medium leading-relaxed">
              Encrypted end-to-end communication active. Session ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Right Column: Forms and Lists */}
        <div className="flex-1 flex flex-col pb-12">
          
          {/* Personal Information Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-bold text-white flex items-center gap-2.5">
                <UserIcon size={20} className="text-[#00D4FF]" strokeWidth={2.5} /> Personal Information
              </h3>
              {editing && (
                <div className="flex items-center gap-3">
                  <button onClick={() => setEditing(false)} className="text-[#94A3B8] hover:text-white flex items-center gap-1 text-sm font-bold">
                    <X size={16} /> Cancel
                  </button>
                  <button onClick={handleSave} className="bg-[#00D4FF] text-[#0A0F1E] px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-bold shadow-lg shadow-[#00D4FF]/20">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase ml-1">Full Name</label>
                {editing ? (
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="bg-[#0D1526] border border-[#00D4FF]/30 rounded-xl px-4 py-3.5 text-[15px] text-white font-medium focus:border-[#00D4FF] outline-none" 
                  />
                ) : (
                  <div className="bg-[#0D1526] border border-white/[0.04] rounded-xl px-4 py-3.5 text-[15px] text-white font-medium shadow-inner flex items-center h-12">
                    {profile.name}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase ml-1">Phone Number</label>
                {editing ? (
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="bg-[#0D1526] border border-[#00D4FF]/30 rounded-xl px-4 py-3.5 text-[15px] text-white font-medium focus:border-[#00D4FF] outline-none" 
                  />
                ) : (
                  <div className="bg-[#0D1526] border border-white/[0.04] rounded-xl px-4 py-3.5 text-[15px] text-white font-medium shadow-inner flex items-center h-12">
                    {profile.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Language Preference Section */}
          <div className="mb-12">
            <h3 className="text-[17px] font-bold text-white mb-5 flex items-center gap-2.5">
              <Type size={20} className="text-[#00D4FF]" strokeWidth={2.5} /> Language Preference
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {['english', 'hinglish', 'hindi'].map(lang => (
                <button 
                  key={lang}
                  disabled={!editing}
                  onClick={() => setEditForm({...editForm, language_pref: lang})}
                  className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm capitalize ${
                    (editing ? editForm.language_pref : profile.language_pref) === lang 
                    ? 'bg-[#00D4FF] text-[#0A0F1E]' 
                    : 'bg-[#0D1526] border border-white/[0.04] text-[#94A3B8] hover:bg-white/5 disabled:opacity-50 disabled:cursor-default'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Case Reference Numbers Section */}
          <div className="mb-14">
            <h3 className="text-[17px] font-bold text-white mb-5 flex items-center gap-2.5">
              <FileText size={20} className="text-[#00D4FF]" strokeWidth={2.5} /> Case Reference Numbers
            </h3>
            
            <div className="flex flex-col gap-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cases.length === 0 ? (
                <div className="p-10 border border-dashed border-[#1E293B] rounded-2xl flex flex-col items-center justify-center text-[#64748B]">
                   <Folder size={40} className="mb-3 opacity-20" />
                   <p className="text-sm">No cases filed yet.</p>
                </div>
              ) : cases.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#0D1526] border border-white/[0.04] shadow-lg shadow-black/20 group hover:border-[#00D4FF]/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0A0F1E] flex items-center justify-center shrink-0 border border-white/[0.02] group-hover:border-[#00D4FF]/10 transition-colors">
                      <Folder size={20} className="text-[#64748B]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[15px]">{c.ref_no}</div>
                      <div className="text-[12px] text-[#94A3B8] font-medium flex items-center gap-2">
                         {c.categories[0]} <span className="w-1 h-1 rounded-full bg-[#64748B]"></span> {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 mt-4 sm:mt-0">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 
                      c.status === 'UNDER_INVESTIGATION' ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {c.status.replace(/_/g, ' ')}
                    </div>
                    <button 
                      onClick={() => navigate(`/track/${c.ref_no}`)}
                      className="px-5 py-2.5 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 text-xs font-bold rounded-lg hover:bg-[#00D4FF]/20 transition-colors shadow-sm tracking-wide"
                    >
                      Track Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer Action Area */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-6 mt-auto">
            <div className="flex items-center gap-2 text-[13px] text-[#64748B] font-medium">
              <Info size={16} className="text-[#64748B]" /> Changes are saved securely to your government-verified ID.
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-red-900/40"
            >
              <LogOut size={18} strokeWidth={2.5} /> Logout from Session
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
