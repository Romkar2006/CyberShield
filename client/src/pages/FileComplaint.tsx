import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Phone, Mail, FileText, ChevronRight, 
  ShieldAlert, CheckCircle2, KeyRound, ArrowLeft,
  Brain, Zap, Shield, Fingerprint, Database, Sparkles
} from 'lucide-react';
import { classifyComplaint } from '../lib/api';
import { ComplaintPayload } from '../types';

export const FileComplaint = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ComplaintPayload>({
    name: '',
    phone: '',
    email: '',
    city: '',
    text: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await classifyComplaint(formData);
      navigate('/result', { state: { complaint: res.data } });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'AI Processing failed. Our servers might be currently overloaded.');
      setStep(2); 
    } finally {
      setLoading(false);
    }
  };

  const triggerProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;
    setStep(3); 
    handleSubmit(); 
  };

  const steps = [
    { id: 1, label: 'Identify', icon: <User size={16} /> },
    { id: 2, label: 'Report', icon: <FileText size={16} /> },
    { id: 3, label: 'Analyze', icon: <Brain size={16} /> }
  ];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#0A0F1E] font-['Inter',sans-serif] text-[#E2E8F0] flex flex-col py-12 px-6 relative overflow-hidden">
      
      {/* Structural Tech Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0 flex justify-center">
        <div className="w-full max-w-7xl h-full border-x border-white/[0.05] relative flex justify-evenly">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-px h-full bg-white/[0.05]"></div>
          ))}
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="max-w-4xl mx-auto w-full relative z-10 mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-full px-4 py-1.5 mb-6"
        >
          <Fingerprint size={14} className="text-[#00D4FF]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00D4FF]">Secure Complaint Uplink</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          File <span className="text-[#00D4FF]">Incident</span> Report
        </h1>
        <p className="text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Submit your cybercrime report via our encrypted intelligence gateway. 
          Zephyr 7B AI will automatically map your statement to relevant legal sections in real-time.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto w-full relative z-10">
        
        {/* Step Indicator Panel */}
        <div className="mb-10 bg-[#0D1526] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between shadow-2xl">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-3 flex-1 justify-center px-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 border ${
                  step >= s.id 
                    ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]' 
                    : 'bg-[#1E293B] border-white/[0.08] text-[#64748B]'
                }`}>
                  {step > s.id ? <CheckCircle2 size={18} /> : s.id}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-[#00D4FF]' : 'text-[#64748B]'}`}>{s.label}</span>
                  <span className="text-[9px] text-[#64748B] font-medium leading-none mt-0.5">{step > s.id ? 'Verified' : step === s.id ? 'Active' : 'Pending'}</span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-white/[0.08]"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-[#0D1526] border border-white/[0.08] rounded-2xl p-8 md:p-10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-xl flex items-center justify-center">
                    <User className="text-[#00D4FF]" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Complainant Identity</h2>
                    <p className="text-xs text-[#64748B]">Verification details for official logging</p>
                  </div>
                </div>
                <div className="bg-[#1E293B] px-3 py-1.5 rounded-lg border border-white/[0.05] flex items-center gap-2">
                  <Shield size={14} className="text-[#22C55E]" />
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">End-to-End Encrypted</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Full Legal Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#00D4FF] transition-colors" size={16} />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#1E293B] border border-white/[0.05] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-[#E2E8F0] text-sm transition-all outline-none"
                      placeholder="As per Government ID"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#00D4FF] transition-colors" size={16} />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#1E293B] border border-white/[0.05] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-[#E2E8F0] text-sm transition-all outline-none"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#00D4FF] transition-colors" size={16} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#1E293B] border border-white/[0.05] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-[#E2E8F0] text-sm transition-all outline-none"
                      placeholder="recovery@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] ml-1">Dispatch Jurisdiction</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#00D4FF] transition-colors" size={16} />
                    <select 
                      required
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-[#1E293B] border border-white/[0.05] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] rounded-xl py-3.5 pl-12 pr-4 text-[#E2E8F0] text-sm transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select nearest city</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-white/[0.05]">
                <button 
                  onClick={handleNext}
                  disabled={!formData.name || !formData.phone || !formData.email || !formData.city}
                  className="bg-[#00D4FF] hover:bg-[#00BBDD] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1E] font-bold px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
                >
                  Confirm Identity <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Incident Report */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0D1526] border border-white/[0.08] rounded-2xl p-8 md:p-10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-xl flex items-center justify-center">
                    <FileText className="text-[#00D4FF]" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Incident Statement</h2>
                    <p className="text-xs text-[#64748B]">Natural language processing system active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#7C3AED]/10 px-3 py-1.5 rounded-lg border border-[#7C3AED]/20">
                  <Brain size={14} className="text-[#7C3AED]" />
                  <span className="text-[10px] font-bold text-[#E2E8F0] uppercase tracking-wider">Zephyr 7B Ready</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                  <ShieldAlert size={16} /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative group">
                    <textarea 
                      required
                      value={formData.text}
                      onChange={e => setFormData({...formData, text: e.target.value})}
                      rows={10}
                      className="w-full bg-[#1E293B] border border-white/[0.05] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] rounded-2xl p-6 text-[#E2E8F0] text-base transition-all outline-none resize-none leading-relaxed placeholder:text-[#64748B]"
                      placeholder="Begin typing your statement here. Use Hindi, Hinglish, or English. Be specific about UPI IDs, links, and dates..."
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-mono text-[#64748B]">
                      <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></div>
                      SECURE BUFFER ACTIVE
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#1E293B]/50 border border-white/[0.05] rounded-xl p-6">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#00D4FF] mb-4 flex items-center gap-2">
                       <Zap size={14} /> Intelligence Feed
                    </h3>
                    <ul className="space-y-4">
                      {[
                        { label: 'Financial Entities', desc: 'UPI IDs, Account Nos', icon: <Database size={14} /> },
                        { label: 'Cyber Artifacts', desc: 'Links (URLs), APKs', icon: <Sparkles size={14} /> },
                        { label: 'Time Dynamics', desc: 'Exact dates and times', icon: <Zap size={14} /> }
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 border border-white/[0.05]">
                            <div className="text-[#64748B]">{item.icon}</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-[#E2E8F0]">{item.label}</div>
                            <div className="text-[10px] text-[#64748B]">{item.desc}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                      <p className="text-[10px] text-emerald-400/70 leading-relaxed uppercase font-bold tracking-wider">
                        AI will map your statement to BNS 2024 Legal Sections automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-white/[0.05]">
                <button 
                  onClick={handlePrev}
                  className="flex items-center gap-2 text-[#64748B] hover:text-[#E2E8F0] text-xs font-bold uppercase tracking-widest transition"
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <div className="flex items-center gap-4">
                   <div className="hidden sm:block text-right">
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Statement Integrity</div>
                      <div className="text-[11px] font-mono text-[#00D4FF]">
                        {formData.text.length} CHARS LOGGED
                      </div>
                   </div>
                   <button 
                    onClick={triggerProcess}
                    disabled={!formData.text.trim() || formData.text.length < 20}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-30 text-white font-bold px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all flex items-center gap-3 uppercase text-xs tracking-widest"
                  >
                    <KeyRound size={18} /> INITIATE AI SCAN
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Scanner UI (Loading State) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0D1526] border border-[#00D4FF]/20 rounded-2xl p-12 shadow-[0_0_50px_rgba(0,212,255,0.1)] flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden text-center"
            >
              {/* Tactical Scanning Background Animation */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <motion.div 
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent shadow-[0_0_20px_rgba(0,212,255,1)]"
                  animate={{ top: ['-10%', '110%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-28 h-28 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] relative mb-10 flex items-center justify-center group overflow-hidden shadow-2xl">
                  {/* Rotating Orbitals */}
                  <div className="absolute inset-2 border-2 border-dashed border-[#00D4FF]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-0 border-4 border-[#00D4FF]/10 rounded-full border-t-[#00D4FF] animate-spin"></div>
                  <Brain size={48} className="text-[#00D4FF] animate-pulse" />
                </div>

                <div className="mb-4 inline-flex items-center gap-2 bg-[#00D4FF]/10 px-4 py-1.5 rounded-lg border border-[#00D4FF]/20">
                  <Zap size={14} className="text-[#00D4FF]" />
                  <span className="text-[11px] font-bold text-[#00D4FF] uppercase tracking-widest">Processing Intelligence</span>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-6">Analyzing Statement Pattern</h2>
                
                <div className="w-full max-w-md bg-[#1E293B]/50 border border-white/[0.05] rounded-xl p-6 mb-8 text-left">
                  <div className="flex flex-col gap-4">
                    {[
                      { id: 1, label: 'Language Core', status: 'COMPLETE', t: 0.5 },
                      { id: 2, label: 'Context Translation', status: 'COMPLETE', t: 1.5 },
                      { id: 3, label: 'Zephyr 7B Extraction', status: 'ACTIVE', t: 10 },
                      { id: 4, label: 'BNS 2024 Legal Mapping', status: 'PENDING', t: 0.5 },
                      { id: 5, label: 'FIR Document Generation', status: 'PENDING', t: 1.0 }
                    ].map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'COMPLETE' ? 'bg-emerald-500' : s.status === 'ACTIVE' ? 'bg-[#00D4FF] animate-ping' : 'bg-[#64748B]'}`}></div>
                          <span className={`text-xs font-medium ${s.status === 'ACTIVE' ? 'text-white' : 'text-[#64748B]'}`}>{s.label}</span>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${s.status === 'COMPLETE' ? 'text-emerald-500' : s.status === 'ACTIVE' ? 'text-[#00D4FF]' : 'text-[#64748B]'}`}>
                          {s.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-full max-w-sm h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-6">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#00D4FF] via-[#7C3AED] to-[#00D4FF] bg-[length:200%_100%]"
                    initial={{ width: '0%', backgroundPosition: '0% 0%' }}
                    animate={{ width: '92%', backgroundPosition: '100% 0%' }}
                    transition={{ 
                      width: { duration: 15, ease: "easeOut" },
                      backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                    }}
                  />
                </div>
                
                <p className="text-[10px] text-[#64748B] uppercase tracking-[0.3em] font-bold">
                  Establishing digital signature...
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Security Footer Note */}
      <div className="mt-auto pt-12 flex flex-col items-center gap-4 relative z-10 opacity-50">
        <div className="flex items-center gap-6">
          <Shield size={16} />
          <DATABASE size={16} />
          <Fingerprint size={16} />
        </div>
        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#64748B]">
          AES-256 Bit Encryption | SOC2 Level 3 Secure | 24/7 Monitoring
        </div>
      </div>
    </div>
  );
};

// Internal sub-component for uppercase DATABASE to avoid confusion
const DATABASE = ({ size }: { size: number }) => <Database size={size} />;
const ShieldCheck = ({ size, className }: { size: number, className: string }) => <CheckCircle2 size={size} className={className} />;
