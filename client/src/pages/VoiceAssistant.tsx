import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Mic, MicOff, Volume2, VolumeX, Shield, 
  Cpu, Activity, Zap, X, ChevronRight, Activity as WaveformIcon,
  Headphones, Lock, Radar
} from 'lucide-react';
import { isUserLoggedIn } from '../lib/auth';
import { useAuthModal } from '../components/layout/AuthContext';

import { chatWithBot } from '../lib/api';

const BNS_GLITCH_TEXT = [
  "BNS Section 308 - Extortion",
  "Forensic Handshake Verified",
  "Tracing UPI Endpoint...",
  "Neural Link Secure",
  "Officer KAVACH Online"
];

export const VoiceAssistant = () => {
  const { showAuthModal } = useAuthModal();
  const [isCalling, setIsCalling] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [displayText, setDisplayText] = useState('Initiate Voice Command to Connect with CyberShield Intelligence');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [metrics, setMetrics] = useState({ latency: '0.24ms', encryption: 'AES-256', link: 'Stable' });
  const [checklist, setChecklist] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'info' | 'critical' | 'legal'>('info');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = window.speechSynthesis;

  // ── Speech Generation (Institutional Voice Node) ─────────────────────────
  const speak = useCallback((text: string) => {
    if (isMuted || !synthRef) return;
    
    // Always clear existing speech buffer before new transmission
    synthRef.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.getVoices();
    
    // Detection for Multilingual Routing
    const hasHindi = /[\u0900-\u097F]/.test(text);
    let selectedVoice = null;
    
    // TARGET: High-Fidelity Indian Accents
    if (hasHindi) {
       selectedVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi'));
    } else {
       // Primary: Google English India | Secondary: Microsoft Heera/Rishi
       selectedVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India') || v.name.includes('Rishi') || v.name.includes('Heera'));
    }
    
    // Fallback: Professional Neutral
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google'))) || voices[0];
    }

    utterance.voice = selectedVoice;
    utterance.pitch = 1.0;
    utterance.rate = 1.05; // Slightly faster for operational urgency
    utterance.volume = 1;
    
    // AUTO-LISTEN: Kavach waits for user response after completing a report/guidance
    utterance.onend = () => {
       if (isCalling && !isListening && !isLoading) {
         // Subtle delay to prevent accidental mic trigger from ambient echo
         setTimeout(() => startListening(), 300);
       }
    };

    synthRef.speak(utterance);
  }, [isMuted, isCalling, isListening, isLoading]);

  // ── Speech Recognition ──────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setTranscript(currentTranscript);
        
        if (event.results[0].isFinal) {
          processQuery(currentTranscript);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    
    return () => {
      synthRef.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      // PREVENT TALK-OVER: Stop Kavach instantly if user interrupts
      if (synthRef.speaking) {
        synthRef.cancel();
      }
      
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Recognition already active.");
      }
    }
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) return;
    setIsListening(false);
    setIsLoading(true);
    setDisplayText('Analyzing Cyber Intelligence...');

    try {
      const start = Date.now();
      const response = await chatWithBot({
        message: query,
        history: voiceHistory
      });
      const end = Date.now();
      setMetrics(prev => ({ ...prev, latency: `${Math.round(end - start)}ms` }));

      const reply = response.data.reply;
      if (!reply) throw new Error("Intelligence link unstable.");

      // ── TACTICAL ANALYSIS: DYNAMIC CONTEXT COLOR ──
      const lowerReply = reply.toLowerCase();
      if (lowerReply.includes('1930') || lowerReply.includes('critical') || lowerReply.includes('immediately')) {
         setSeverity('critical');
      } else if (lowerReply.includes('bns') || lowerReply.includes('section')) {
         setSeverity('legal');
      } else {
         setSeverity('info');
      }

      // ── FORENSIC EXTRACTION: OPERATIONAL CHECKLIST ──
      const stepsMatch = reply.match(/(?:\d+\.|\*)\s*([^\n.]{10,})/g);
      if (stepsMatch) {
        setChecklist(stepsMatch.map(s => s.replace(/^\d+\.\s*|\*\s*/, '').trim()));
      }

      setVoiceHistory(prev => [...prev, 
        { role: 'user', content: query },
        { role: 'assistant', content: reply }
      ]);
      setDisplayText(reply);
      speak(reply);
    } catch (err: any) {
      const errorMsg = err.response?.data?.reply || err.message || 'Network Congestion';
      console.error('🚨 KAVACH NODE ERROR:', errorMsg);
      const recoveryMsg = "The intelligence link is experiencing high forensic load. Retrying handshake...";
      setDisplayText(recoveryMsg);
      speak(recoveryMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = () => {
    if (!isUserLoggedIn()) {
      showAuthModal();
      return;
    }
    
    setIsCalling(true);
    setDisplayText('CyberShield Intelligence Linked. Authenticating...');
    setTimeout(() => {
      const welcome = "Welcome to CyberShield Voice Hotline. I am Kavach. State your emergency or ask for procedural guidance.";
      setDisplayText(welcome);
      speak(welcome);
    }, 1500);
  };


  const endCall = () => {
    setIsCalling(false);
    setIsListening(false);
    setDisplayText('Operational Line Terminated.');
    setVoiceHistory([]);
    setTranscript('');
    synthRef.cancel();
    recognitionRef.current?.stop();
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#050812] relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 font-['Inter',sans-serif]">
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px)] bg-[size:100%_4px]"></div>
      </div>

      {/* ── Main Dashboard ── */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start relative z-10 py-6 sm:py-10">
        
        {/* Left Aspect: Visualization & Metrics (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col items-center gap-8 sticky top-10">
          <div className="relative">
            {/* Pulsing Outer Rings */}
            <AnimatePresence>
              {isCalling && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0.15 }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full border-2 shadow-2xl ${
                      severity === 'critical' ? 'border-red-500 shadow-red-500/50' : 
                      severity === 'legal' ? 'border-violet-500 shadow-violet-500/50' : 
                      'border-cyan shadow-cyan/50'
                    }`}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Core Orb */}
            <motion.div 
              animate={isCalling ? { 
                scale: isListening ? [1, 1.05, 1] : 1,
                rotate: 360,
                boxShadow: severity === 'critical' ? '0 0 100px rgba(239,68,68,0.3)' : '0 0 60px rgba(34,211,238,0.2)'
              } : {}}
              transition={isListening ? { duration: 1, repeat: Infinity } : { duration: 60, repeat: Infinity, ease: "linear" }}
              className={`w-52 h-52 sm:w-64 sm:h-64 rounded-[2.5rem] sm:rounded-[3rem] border-2 flex items-center justify-center relative bg-black/40 backdrop-blur-3xl transition-all duration-700 ${
                !isCalling ? 'border-white/5' :
                severity === 'critical' ? 'border-red-500/50' : 
                severity === 'legal' ? 'border-violet-500/50' : 
                'border-cyan/40'
              }`}
            >
              <div className={`absolute inset-0 rounded-[2.5rem] sm:rounded-[3rem] transition-colors duration-1000 ${
                severity === 'critical' ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' : 
                severity === 'legal' ? 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20' : 
                'bg-gradient-to-br from-cyan/20 via-transparent to-teal-500/20'
              }`}></div>
              
              <AnimatePresence mode="wait">
                {!isCalling ? (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-gray-500 p-4"
                  >
                    <Radar size={60} className="sm:size-20 mb-4 opacity-20" />
                    <span className="text-[8px] sm:text-[10px] font-black tracking-[0.3em] uppercase text-center">Ready for Deployment</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="active"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    {isListening ? (
                      <div className="flex gap-1 items-center h-16">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [10, 40, 10], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                            className={`w-2 rounded-full ${severity === 'critical' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cyan shadow-[0_0_10px_#22d3ee]'}`}
                          />
                        ))}
                      </div>
                    ) : isLoading ? (
                      <div className="relative">
                         <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className={`w-16 h-16 rounded-full border-4 border-white/5 ${severity === 'critical' ? 'border-t-red-500' : 'border-t-cyan'}`}
                         />
                         <Cpu size={24} className={severity === 'critical' ? 'text-red-500' : 'text-cyan'} />
                      </div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex flex-col items-center gap-3"
                      >
                         <Shield size={64} className={`${severity === 'critical' ? 'text-red-500' : 'text-cyan'} drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]`} />
                         {isCalling && (
                           <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${
                             severity === 'critical' ? 'text-red-500 border-red-500/30' : 'text-cyan border-cyan/30'
                           }`}>
                             {severity} Response Node
                           </div>
                         )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ── SIGNAL METRICS PANEL ── */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
            {[
              { label: 'Latency', val: metrics.latency, icon: Activity, color: 'text-cyan' },
              { label: 'Encryption', val: metrics.encryption, icon: Lock, color: 'text-emerald-500' },
              { label: 'Neural Link', val: metrics.link, icon: Zap, color: 'text-amber-500' }
            ].map((m, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                <m.icon size={12} className={m.color} />
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">{m.label}</span>
                <span className="text-[10px] font-bold text-white font-mono">{m.val}</span>
              </div>
            ))}
          </div>

          {/* Glitch Overlay Text */}
          <div className="h-6 overflow-hidden text-[#475569] text-[9px] font-black uppercase tracking-[0.4em] text-center w-full">
            <motion.div
              animate={{ y: [0, -24, -48, -72, -96, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >

              {BNS_GLITCH_TEXT.map((text, i) => (
                <div key={i} className="h-6 flex items-center justify-center gap-3">
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse"></span>
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Aspect: Controls & Output (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white/5 border border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-col min-h-[550px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <Lock size={120} />
          </div>

          <div className="flex-1 flex flex-col gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Secure Audio Stream</span>
              </div>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all w-fit ${
                  isMuted ? 'border-red-500/30 text-red-500 bg-red-500/10' : 'border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {isMuted ? 'Muted' : 'Audio Live'}
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center py-6">
              <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                <Zap size={12} className="text-cyan" /> Intelligence Feed
              </div>
              <motion.div 
                key={displayText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-bold text-white tracking-tight leading-snug break-words ${
                  displayText.length > 200 ? 'text-base sm:text-lg' : 
                  displayText.length > 100 ? 'text-lg sm:text-xl' : 
                  'text-xl sm:text-3xl'
                }`}
              >
                {displayText}
              </motion.div>
              
              {checklist.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-cyan/5 border border-cyan/10 rounded-2xl"
                >
                  <span className="text-[9px] font-black text-cyan uppercase tracking-widest block mb-3 flex items-center gap-2">
                    <Activity size={10} /> Operational Checklist
                  </span>
                  <div className="space-y-2">
                    {checklist.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan/40 group-hover:bg-cyan group-hover:scale-125 transition-all"></div>
                        <p className="text-xs text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {transcript && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm"
                >
                  <span className="text-[9px] font-black text-cyan uppercase tracking-widest block mb-2">Live Transcript</span>
                  <p className="text-gray-400 text-sm italic tracking-tight">"{transcript}"</p>
                </motion.div>
              )}
            </div>

            {/* ── INCIDENT TRIGGERS ── */}
            {isCalling && (
               <div className="flex flex-wrap gap-2 mb-2">
                 {[
                   { label: '1930 Emergency', cmd: 'Immediately assist with 1930 protocol for financial fraud', icon: Phone },
                   { label: 'Track My Case', cmd: 'I want to track my filed FIR status', icon: Radar },
                   { label: 'Identity Theft', cmd: 'My personal account has been hacked', icon: Headphones }
                 ].map((t, i) => (
                   <button 
                    key={i}
                    onClick={() => processQuery(t.cmd)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-cyan/10 hover:border-cyan/30 hover:text-cyan transition-all"
                   >
                     <t.icon size={12} />
                     {t.label}
                   </button>
                 ))}
               </div>
            )}

            <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-white/5">
               {!isCalling ? (
                 <button 
                  onClick={startCall}
                  className="w-full bg-gradient-to-r from-cyan to-indigo-500 p-6 rounded-3xl text-[#050812] font-black text-sm tracking-widest uppercase hover:shadow-[0_10px_40px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   <Phone size={24} fill="currentColor" />
                   Initiate Secure Call
                 </button>
               ) : (
                 <div className="grid grid-cols-4 gap-4">
                   <button 
                    onClick={endCall}
                    className="col-span-1 bg-red-500/20 border border-red-500/30 text-red-500 p-6 rounded-3xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                   >
                     <X size={24} />
                   </button>
                   <button 
                    onClick={startListening}
                    disabled={isListening || isLoading}
                    className={`col-span-3 p-6 rounded-3xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${
                      isListening ? 'bg-cyan text-[#050812] shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                   >
                     {isListening ? <WaveformIcon className="animate-bounce" /> : <Mic size={20} />}
                     {isListening ? 'KAVACH Listening...' : 'Speak Now'}
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* ── RECENT TRANSMISSION HISTORY (lg:col-span-3) ── */}
        <div className="lg:col-span-3 h-full flex flex-col gap-6 sticky top-10">
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <Activity size={14} className="text-cyan" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Call Transmissions</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {voiceHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <Radar size={40} className="mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Awaiting Signal</p>
                </div>
              ) : (
                [...voiceHistory].reverse().map((h, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <span className={`text-[8px] font-black uppercase tracking-widest ${h.role === 'user' ? 'text-gray-500' : 'text-cyan'}`}>
                          {h.role === 'user' ? 'Citizen' : 'Officer Kavach'}
                       </span>
                       <span className="text-[7px] font-mono text-gray-600">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${h.role === 'user' ? 'text-gray-400 italic' : 'text-white font-medium'}`}>
                      {h.content.length > 100 ? h.content.substring(0, 100) + '...' : h.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
               <div className="flex items-center gap-2 text-gray-600">
                  <Shield size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
               </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 rounded-[2rem] p-5">
             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">CyberShield Helpline</span>
             <p className="text-[10px] text-gray-500 font-bold tracking-tight">NATIONAL EMERGENCY: 1930</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-30 text-center">
        <div className="flex items-center gap-2">
          <Headphones size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Crystal Voice Engine</span>
        </div>
        <div className="hidden sm:block w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Encrypted Handshake</span>
        </div>
        <div className="hidden sm:block w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Latency: <span className="text-cyan">0.24ms</span></span>
        </div>
      </div>
    </div>
  );
};
