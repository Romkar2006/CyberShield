import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, Mail, ArrowRight, Terminal } from 'lucide-react';
import { userLogin, userRegister } from '../lib/api';
import SimpleGlobe from '../components/shared/SimpleGlobe';

export const Login = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Reset errors when tab changes
  useEffect(() => {
    setError('');
  }, [tab]);

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { width: '0%', color: 'bg-transparent', label: '' };
    if (pw.length < 6) return { width: '33%', color: 'bg-red-500', label: 'Weak' };
    if (pw.length < 10) return { width: '66%', color: 'bg-amber-400', label: 'Medium' };
    return { width: '100%', color: 'bg-emerald-500', label: 'Strong' };
  };

  const strength = getPasswordStrength(signupPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginEmail || !loginPassword) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);
    try {
      const res = await userLogin({ email: loginEmail, password: loginPassword });
      localStorage.setItem('cybershield_user_token', res.data.token);
      localStorage.setItem('cybershield_user_name', res.data.user.name);
      
      const from = new URLSearchParams(window.location.search).get('from') || '/dashboard';
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or server offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      return setError('All fields are required.');
    }
    if (signupPassword !== signupConfirmPassword) {
      return setError('Passwords do not match.');
    }
    if (signupPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await userRegister({ name: signupName, email: signupEmail, password: signupPassword });
      localStorage.setItem('cybershield_user_token', res.data.token);
      localStorage.setItem('cybershield_user_name', res.data.user.name);
      
      const from = new URLSearchParams(window.location.search).get('from') || '/dashboard';
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white flex overflow-hidden selection:bg-[#00D4FF] selection:text-[#0A0F1E]">
      
      {/* LEFT COLUMN: The Interactive Globe */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[#050B14] border-r border-[#1E293B]">
        {/* Globe Instance */}
        <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen scale-105">
          <SimpleGlobe />
        </div>
        
        {/* Overlays to blend the edges of the globe into the dark background */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050B14_90%)] z-10"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{ backgroundImage: 'linear-gradient(to right, #00D4FF 1px, transparent 1px), linear-gradient(to bottom, #00D4FF 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Optional text overlay on the left */}
        <div className="absolute left-12 bottom-12 z-20 max-w-md pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-[#00D4FF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)]">
              <Shield className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">CyberShield SOC</h2>
          </div>
          <p className="text-[#64748B] text-sm leading-relaxed">
            Protecting citizens through advanced cyber threat intelligence and real-time intervention across the national infrastructure network.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: The Auth Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">
        {/* Mobile-only background globe (faded) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 lg:hidden mix-blend-screen scale-110">
          <SimpleGlobe />
        </div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#0A0F1E_80%)] z-0 mix-blend-multiply lg:hidden"></div>

        {/* Main Authentication Card */}
        <motion.div 
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative z-10 w-full max-w-md px-6 py-12"
        >
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="w-16 h-16 rounded-2xl bg-[#0D1526]/80 border border-[#1E293B] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,212,255,0.1)] group hover:shadow-[0_0_40px_rgba(0,212,255,0.25)] transition-all">
              <Shield className="w-8 h-8 text-[#00D4FF] group-hover:scale-110 transition-transform duration-300" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">Access CyberShield</h1>
            <p className="text-[#64748B] text-sm mt-1">Encrypted Citizen Portal</p>
          </div>

          <div className="bg-[#0D1526]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl relative">
            
            {/* Terminal Window Header Decor */}
            <div className="w-full bg-[#0A0F1E]/90 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="flex items-center gap-1.5 ml-auto text-[10px] text-[#00D4FF]/70 font-mono tracking-widest uppercase">
                <Terminal size={10} />
                Connection Secure
              </div>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-1 flex mb-6 relative">
                <button 
                  className={`relative flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 ${tab === 'login' ? 'text-white' : 'text-[#64748B] hover:text-white'}`}
                  onClick={() => setTab('login')}
                  type="button"
                >
                  Login
                </button>
                <button 
                  className={`relative flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 ${tab === 'signup' ? 'text-white' : 'text-[#64748B] hover:text-white'}`}
                  onClick={() => setTab('signup')}
                  type="button"
                >
                  Sign Up
                </button>
                
                {/* Animated Tab Indicator */}
                <motion.div 
                  layoutId="tabBackground"
                  className="absolute inset-y-1 w-[calc(50%-4px)] bg-[#1E293B] shadow rounded-lg border border-white/[0.04] z-0"
                  initial={false}
                  animate={{ x: tab === 'login' ? '4px' : 'calc(100% + 4px)' }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              </div>

              {/* Error Banner */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-start gap-2 overflow-hidden"
                  >
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forms Container */}
              <div className="relative w-full">
                <AnimatePresence mode="wait">
                  
                  {tab === 'login' && (
                    <motion.form 
                      key="loginForm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleLogin}
                      className="flex flex-col gap-4 w-full"
                    >
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                        />
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#00D4FF] transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      <button disabled={loading} type="submit" className="w-full bg-[#00D4FF] text-[#0A0F1E] font-bold py-3 rounded-lg hover:brightness-110 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Authenticating...' : 'Access Terminal'} <ArrowRight size={16} />
                      </button>
                    </motion.form>
                  )}

                  {tab === 'signup' && (
                    <motion.form 
                      key="signupForm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSignup}
                      className="flex flex-col gap-4 w-full"
                    >
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input 
                          type="text" 
                          placeholder="Full Legal Name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                        />
                      </div>

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                        />
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Create Password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#00D4FF] transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      <div className="w-full space-y-1 font-mono">
                        <div className="w-full h-1 bg-[#1E293B] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${strength.color}`} 
                            style={{ width: strength.width }}
                          ></div>
                        </div>
                        {strength.label && <div className={`text-[10px] text-right tracking-wider font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</div>}
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Confirm Password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)] transition-all"
                        />
                      </div>

                      <button disabled={loading} type="submit" className="w-full bg-white text-[#0A0F1E] font-bold py-3 rounded-lg hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Initializing...' : 'Initialize Profile'} <ArrowRight size={16} />
                      </button>
                    </motion.form>
                  )}

                </AnimatePresence>
              </div>
              
            </div>
          </div>

          {/* Bottom Footer Links */}
          <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
            <Link to="/admin/login" className="text-[#00D4FF] hover:text-cyan-300 transition-colors flex items-center gap-1 opacity-80 pt-1">
              System Administrator Access →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
