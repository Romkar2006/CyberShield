import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, Mail } from 'lucide-react';
import { adminLoginRequest, adminLoginVerify, checkAdminSetup } from '../lib/api';
import { setToken } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    checkAdminSetup()
      .then(res => {
        // Only redirect to setup if NO admin exists
        // (bypass user can still log in without setting up)
        if (res.data.setupRequired) {
          navigate('/admin/setup');
        }
      })
      .catch((err) => {
        // If setup check fails (server error), just stay on login page
        console.error('Setup check failed', err);
      })
      .finally(() => {
        setCheckingSetup(false);
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !badgeId) return;
    
    setLoading(true);
    setError('');

    try {
      if (!otpSent) {
        await adminLoginRequest({ email, badgeId });
        setOtpSent(true);
      } else {
        if (!otp || otp.length < 6) {
          setError('Please enter the complete 6-digit OTP code.');
          setLoading(false);
          return;
        }
        const res = await adminLoginVerify({ email, badgeId, otp_code: otp });
        if (res.data?.token) {
          setToken(res.data.token);
          window.location.href = '/admin'; // Force reload to re-mount layouts with admin status
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-4" />;
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-4 selection:bg-[#00D4FF] selection:text-[#0A0F1E]">
      <div className="w-full max-w-md bg-[#0D1526] border border-[#1E293B] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,212,255,0.15)] group hover:border-[#00D4FF]/30 transition-colors">
            <Shield className="w-8 h-8 text-[#00D4FF]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E2E8F0] mb-2">SOC Command Access</h1>
          <p className="text-[#94A3B8] text-sm text-center">Enter your official Govt Email and Badge ID to authenticate module connection.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center font-medium flex items-center gap-2 justify-center relative z-10">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {!otpSent ? (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Govt Email (.gov.in / .nic.in)" 
                  className="w-full bg-[#0A0F1E] border border-[#ffffff14] rounded-lg py-4 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all text-[#E2E8F0] placeholder:text-[#64748B]" 
                  required 
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input 
                  type="password" 
                  value={badgeId}
                  onChange={e => setBadgeId(e.target.value)}
                  placeholder="Officer Badge ID (e.g. Omkar@0102)" 
                  className="w-full bg-[#0A0F1E] border border-[#ffffff14] rounded-lg py-4 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all text-[#00D4FF] font-mono tracking-widest placeholder:text-[#64748B] placeholder:font-sans placeholder:tracking-normal" 
                  required 
                />
              </div>
            </>
          ) : (
            <div className="relative flex flex-col gap-2">
              <label className="text-sm text-[#94A3B8] text-center mb-2">
                A verification code was sent to your email.
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
                  required 
                />
              </div>
              <button 
                type="button" 
                onClick={() => { setOtpSent(false); setOtp(''); }}
                className="text-xs text-[#64748B] hover:text-[#00D4FF] transition-colors self-center mt-2"
              >
                Use different credentials
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !badgeId || !email || (otpSent && otp.length < 6)}
            className="w-full bg-[#00D4FF] text-[#0A0F1E] font-bold py-4 rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(0,212,255,0.40)] transition-all mt-4 disabled:opacity-50 flex items-center justify-center relative overflow-hidden group"
          >
            {loading ? (otpSent ? 'Verifying OTP...' : 'Authenticating Interface...') : (otpSent ? 'VERIFY SECURE CONNECTION' : 'AUTHORIZE CONNECTION')}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-[#64748B] uppercase tracking-widest relative z-10 border-t border-[#1E293B] pt-6">
          System Core Online
        </div>
      </div>
    </div>
  );
};
