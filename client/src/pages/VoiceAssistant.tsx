import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Mic, MicOff, Volume2, VolumeX, Shield, 
  Cpu, Activity, Zap, X, ChevronRight, Activity as WaveformIcon,
  Headphones, Lock, Radar
} from 'lucide-react';

import { chatWithBot } from '../lib/api';

const BNS_GLITCH_TEXT = [
  "BNS Section 308 - Extortion",
  "Forensic Handshake Verified",
  "Tracing UPI Endpoint...",
  "Neural Link Secure",
  "Officer KAVACH Online"
];

export const VoiceAssistant = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [displayText, setDisplayText] = useState('Initiate Voice Command to Connect with CyberShield Intelligence');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = window.speechSynthesis;

  // ── Speech Generation (Officer Voice) ─────────────────────────
  const speak = useCallback((text: string) => {
    if (isMuted || !synthRef) return;
    
    synthRef.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.getVoices();
    
    const hasHindi = /[\u0900-\u097F]/.test(text);
    let selectedVoice = null;
    
    if (hasHindi) {
       selectedVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi'));
    } else {
       selectedVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India') || v.name.includes('Rishi'));
    }
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices[0];
    }

    utterance.voice = selectedVoice;
    utterance.pitch = 0.95;
    utterance.rate = 1.0;
    
    // Auto-listen after speaking ends
    utterance.onend = () => {
       if (isCalling && !isListening) {
         startListening();
       }
    };

    synthRef.speak(utterance);
  }, [isMuted, isCalling, isListening]);

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
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) return;
    setIsListening(false);
    setIsLoading(true);
    setDisplayText('Analyzing Cyber Intelligence...');

    try {
      console.log('📡 CyberShield Handshake: Sending payload to Kavach Node...', { query, history: voiceHistory });
      
      const response = await chatWithBot({
        message: query,
        history: voiceHistory
      });

      console.log('✅ Intelligence Received:', response.data);

      const reply = response.data.reply;
      if (!reply) throw new Error("Null data packet received from node.");

      setVoiceHistory(prev => [...prev, 
        { role: 'user', content: query },
        { role: 'assistant', content: reply }
      ]);
      setDisplayText(reply);
      speak(reply);
    } catch (err: any) {
      const errorMsg = err.response?.data?.reply || err.message || 'Signal Lost';
      console.error('🚨 KAVACH SIGNAL ERROR:', errorMsg);
      setDisplayText(`System Error: ${errorMsg}`);
      speak(`The secure line has been interrupted due to ${errorMsg}. Please stay on the link.`);
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = () => {
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
    <div className="min-h-[calc(100vh-140px)] bg-[#050812] relative overflow-hidden flex flex-col items-center justify-center p-6 font-['Inter',sans-serif]">
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px)] bg-[size:100%_4px]"></div>
      </div>

      {/* ── Main Dashboard ── */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Aspect: Visualization */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            {/* Pulsing Outer Rings */}
            <AnimatePresence>
              {isCalling && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0.1 }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-cyan shadow-[0_0_50px_rgba(34,211,238,0.5)]"
                  />
                  <motion.div 
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: 2, opacity: 0.05 }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute inset-0 rounded-full border-2 border-violet-500 shadow-[0_0_50px_rgba(139,92,246,0.5)]"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Core Orb */}
            <motion.div 
              animate={isCalling ? { 
                scale: isListening ? [1, 1.05, 1] : 1,
                rotate: 360,
                boxShadow: isListening ? "0 0 80px rgba(34,211,238,0.3)" : "0 0 30px rgba(34,211,238,0.1)"
              } : {}}
              transition={isListening ? { duration: 1, repeat: Infinity } : { duration: 60, repeat: Infinity, ease: "linear" }}
              className={`w-64 h-64 rounded-[3rem] border-2 flex items-center justify-center relative bg-black/40 backdrop-blur-xl transition-all duration-500 ${
                isCalling ? 'border-cyan/40' : 'border-white/5'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-transparent to-violet-500/20 rounded-[3rem]"></div>
              
              <AnimatePresence mode="wait">
                {!isCalling ? (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-gray-500"
                  >
                    <Radar size={80} className="mb-4 opacity-20" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">Ready for Deployment</span>
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
                            className="w-2 bg-cyan rounded-full"
                          />
                        ))}
                      </div>
                    ) : isLoading ? (
                      <div className="relative">
                         <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 rounded-full border-4 border-cyan/10 border-t-cyan"
                         />
                         <Cpu size={24} className="text-cyan absolute inset-0 m-auto" />
                      </div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                         <Shield size={64} className="text-cyan drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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

        {/* Right Aspect: Controls & Output */}
        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col h-[500px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <Lock size={120} />
          </div>

          <div className="flex-1 flex flex-col gap-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Secure Audio Stream</span>
              </div>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                  isMuted ? 'border-red-500/30 text-red-500 bg-red-500/10' : 'border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {isMuted ? 'Muted' : 'Audio Live'}
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                <Zap size={12} className="text-cyan" /> Intelligence Feed
              </div>
              <motion.p 
                key={displayText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white tracking-tight leading-snug line-clamp-6"
              >
                {displayText}
              </motion.p>
              
              {transcript && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5"
                >
                  <span className="text-[9px] font-black text-cyan uppercase tracking-widest block mb-2">Live Transcript</span>
                  <p className="text-gray-400 text-sm italic italic tracking-tight">"{transcript}"</p>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col gap-4">
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
      </div>

      {/* Footer Info */}
      <div className="mt-16 flex items-center gap-8 opacity-30">
        <div className="flex items-center gap-2">
          <Headphones size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Crystal Voice Engine</span>
        </div>
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Encrypted Handshake</span>
        </div>
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Latency: <span className="text-cyan">0.24ms</span></span>
        </div>
      </div>
    </div>
  );
};
