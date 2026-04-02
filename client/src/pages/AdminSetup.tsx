import React, { useState } from 'react';
import { Shield, Key, CheckCircle2 } from 'lucide-react';
import { setupAdminRequest, setupAdminVerify } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const AdminSetup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    
    if (!email || !badgeId) {
      setLoading(false);
      return setError('Official Govt Email and Badge ID are required.');
    }
    
    try {
      if (!otpSent) {
        await setupAdminRequest({ email, badgeId });
        setOtpSent(true);
      } else {
        if (!otp || otp.length < 6) {
          setLoading(false);
          return setError('Please enter the complete 6-digit OTP code.');
        }
        await setupAdminVerify({ email, badgeId, otp_code: otp });
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initialize administrator account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-4 selection:bg-[#00D4FF] selection:text-[#0A0F1E]">
      <div className="w-full max-w-lg bg-[#0D1526] border border-[#1E293B] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-[#0F172A] border border-[#00D4FF]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
            <Shield className="w-8 h-8 text-[#00D4FF]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E2E8F0] mb-2 text-center">System Initialization</h1>
          <p className="text-[#94A3B8] text-sm text-center">No Administrator account detected. Register the primary system admin to secure access.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {!isSuccess ? (
          <div className="flex flex-col gap-6 relative z-10">
            <div className="bg-[#0A0F1E] border border-[#00D4FF]/20 p-4 rounded-xl text-[#00D4FF]/90 text-sm">
              <span className="font-bold text-[#00D4FF]">Secure Setup:</span> Your Badge ID will act as your permanent cryptographic hash. Keep it private.
            </div>
            
            <div className="flex flex-col gap-4">
              {!otpSent ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#94A3B8]">Official Govt Email (.gov.in / .nic.in)</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@police.gov.in"
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#94A3B8]">Officer Badge ID</label>
                    <input 
                      type="text" 
                      value={badgeId}
                      onChange={e => setBadgeId(e.target.value)}
                      placeholder="POL-12345"
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg py-3 px-4 text-sm text-white uppercase focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-sm font-medium text-[#94A3B8] text-center mb-1">
                    Enter the 6-digit OTP sent to your government email
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#00D4FF]" />
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP" 
                      className="w-full bg-[#0A0F1E] border border-[#00D4FF]/40 rounded-lg py-4 pl-12 pr-4 text-center text-2xl tracking-[0.4em] focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all text-[#00D4FF] font-mono" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-xs text-[#64748B] hover:text-[#00D4FF] transition-colors self-center mt-2"
                  >
                    Use different details
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || (!otpSent && (!email || !badgeId)) || (otpSent && otp.length < 6)}
              className="w-full bg-[#00D4FF] text-[#0A0F1E] font-bold py-4 rounded-xl hover:brightness-110 shadow-[0_0_25px_rgba(0,212,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <Key size={18} /> {loading ? (otpSent ? 'Verifying OTP...' : 'Generating OTP Request...') : (otpSent ? 'Confirm & Initialize Secure Access' : 'Request OTP')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-emerald-400 text-sm flex items-center justify-center flex-col gap-4">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <div className="text-center font-bold text-lg">System Initialization Complete</div>
              <p className="text-center text-emerald-400/80">
                The Master Account has been bound to your Govt Email and Badge ID.
              </p>
            </div>

            <button 
              onClick={() => navigate('/admin/login')}
              className="w-full bg-[#1E293B] border border-white/[0.06] text-white font-bold py-4 rounded-xl hover:bg-[#334155] transition-all flex items-center justify-center gap-2 mt-2"
            >
              Proceed to Login &rarr;
            </button>
          </div>
        )}
        
        <div className="mt-8 text-center text-[10px] text-[#64748B] uppercase tracking-widest relative z-10">
          CYBERSHIELD KRYPTO CORE V1.0
        </div>
      </div>
    </div>
  );
};
