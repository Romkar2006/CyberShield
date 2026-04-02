import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, RefreshCw, Languages, Shield, Cpu, Activity, Minus, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithBot } from '../../lib/api';
import { ChatMessage } from '../../types';

export const CyberBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickReplies = [
    'How to file a complaint?',
    'Track my case',
    'Mera UPI fraud hua',
    'Emergency helplines',
    'What is BNS 2024?'
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Supports Hindi/English/Hinglish better

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Semi-auto send if transcript is clear
        if (transcript.length > 5) {
          setTimeout(() => sendMessage(transcript), 500);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Detect if the text contains Hindi characters for better voice selection
    const hasHindi = /[\u0900-\u097F]/.test(text);
    
    // Officer-like Voice Selection Logic
    let selectedVoice = null;
    
    if (hasHindi) {
      // Find a natural Hindi voice
      selectedVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi'));
    } else {
      // Find a professional Indian English voice for the 'Officer' feel
      selectedVoice = voices.find(v => 
        (v.lang === 'en-IN') || 
        (v.name.includes('India') && v.lang.startsWith('en')) ||
        (v.name.includes('Rishi')) // Common Indian English system voice
      );
    }
    
    // Fallback to any premium or English voice if target not found
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices[0];
    }
    
    if (selectedVoice) utterance.voice = selectedVoice;
    
    // Tuning for an authoritative "Officer" and "Robotic AI" feel
    utterance.pitch = 0.95; // Slightly lower for authority
    utterance.rate = 0.98;  // Deliberate, clear pace
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled]);


  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = 'Namaste! I am KAVACH AI — Your CyberShield Guardian. Please select your operational language to begin.';
      setMessages([
        {
          role: 'assistant',
          content: welcome,
        }
      ]);
      // Optional: Auto-speak welcome if voice is enabled
      // speakText(welcome);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const selectLanguage = (lang: 'English' | 'Hinglish') => {
    setLanguageSelected(true);
    const content = lang === 'English' ? 'KAVACH-AI Online. How can I protect you today?' : 'KAVACH-AI Online. Main aapki kaise madad kar sakta hoon?';
    setMessages(prev => [...prev,
    { role: 'user', content: lang },
    { role: 'assistant', content: content }
    ]);
    speakText(content);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const resetChat = () => {
    window.speechSynthesis.cancel();
    setMessages([
      {
        role: 'assistant',
        content: 'Namaste! I am KAVACH AI — Your CyberShield Guardian. Please select your operational language to begin / Apni bhasha chunein:',
      }
    ]);
    setLanguageSelected(false);
    setInput('');
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading || !languageSelected) return;

    if (isListening) recognitionRef.current?.stop();

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await chatWithBot({
        message: messageText,
        history
      });

      const reply = response.data.reply;
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
      };

      setMessages(prev => [...prev, botMessage]);
      speakText(reply);
    } catch (err) {
      const errorMsg = 'System overload. Please retry or dial 1930 for manual assistance.';
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorMsg,
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-['Inter',sans-serif]">
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-2xl bg-[#0F172A] border border-cyan/30 flex items-center justify-center text-cyan shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Shield size={32} className="relative z-10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0F172A] animate-pulse"></div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? '80px' : '650px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`w-[400px] max-w-[90vw] bg-white/95 dark:bg-[#050812]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300`}
          >
            {/* TACTICAL HEADER */}
            <div className="bg-gray-50 dark:bg-[#0A0F1E] border-b border-gray-100 dark:border-white/5 p-6 flex items-center justify-between relative overflow-hidden shrink-0 h-[80px]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan to-transparent"></div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                    <Cpu size={24} className="text-cyan animate-pulse" />
                  </div>
                  <motion.div
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0A0F1E]"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tighter leading-none mb-1.5 flex items-center gap-2">
                    KAVACH AI
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">v1.2.0</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Activity size={10} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-gray-400 dark:text-[#475569] uppercase tracking-widest animate-pulse">Neural Link Secure</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} 
                  title={isVoiceEnabled ? "Mute Guidance" : "Enable Voice"}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isVoiceEnabled ? 'bg-cyan/10 text-cyan' : 'bg-gray-200/50 dark:bg-white/5 text-gray-400'}`}
                >
                  {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-200/50 dark:bg-white/5 text-gray-500 dark:text-[#475569] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                  <Minus size={18} />
                </button>
                <button onClick={resetChat} title="Reset Matrix" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-200/50 dark:bg-white/5 text-gray-500 dark:text-[#475569] hover:text-cyan hover:bg-cyan/10 transition-all">
                  <RefreshCw size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* MESSAGES AREA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none relative">
                  {/* Decorative Neural Grid Background */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#22D3EE_1px,transparent_1px)] bg-[size:20px:20px]"></div>

                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`relative max-w-[85%] px-5 py-4 text-xs font-medium leading-relaxed shadow-2xl ${msg.role === 'user'
                          ? 'bg-cyan text-[#050812] rounded-[1.5rem] rounded-tr-none font-extrabold'
                          : 'bg-gray-100 dark:bg-[#0D1526] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-[#94A3B8] rounded-[1.5rem] rounded-tl-none font-semibold'
                        }`}>
                        {msg.content}

                        {!languageSelected && msg.role === 'assistant' && i === 0 && (
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                              onClick={() => selectLanguage('English')}
                              className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-white/5 hover:bg-cyan hover:text-[#050812] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white font-black transition-all text-[10px] uppercase tracking-widest"
                            >
                              English
                            </button>
                            <button
                              onClick={() => selectLanguage('Hinglish')}
                              className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-white/5 hover:bg-indigo-500 hover:text-white border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white font-black transition-all text-[10px] uppercase tracking-widest"
                            >
                              Hinglish
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-100 dark:bg-[#0D1526] border border-gray-200 dark:border-white/5 rounded-[1.2rem] px-5 py-3.5 flex gap-2 items-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-cyan rounded-full"
                        />
                        <span className="text-[10px] font-black text-cyan/60 uppercase tracking-widest">Mapping BNS...</span>
                      </motion.div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* QUICK REPLIES */}
                <div className="px-6 py-4 flex flex-wrap gap-2 shrink-0 bg-gray-50/50 dark:bg-[#0A0F1E]/50 border-t border-gray-100 dark:border-white/5">
                  {languageSelected && !isLoading && quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(reply)}
                      className="text-[9px] font-black px-3 py-2 rounded-lg border border-gray-200 dark:border-white/5 text-gray-500 dark:text-[#475569] hover:bg-cyan/10 hover:border-cyan/30 hover:text-cyan transition-all uppercase tracking-widest"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* INPUT AREA */}
                <div className="p-6 shrink-0 bg-gray-50 dark:bg-[#0A0F1E]">
                  <div className="flex items-center gap-3">
                    <form
                      onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                      className={`flex-1 flex items-center gap-3 bg-white dark:bg-[#050812] rounded-2xl p-2 border border-gray-200 dark:border-white/5 focus-within:border-cyan/30 transition-all duration-300 ${!languageSelected ? 'opacity-30' : ''}`}
                    >
                      <input
                        type="text"
                        value={input}
                        disabled={!languageSelected || isListening}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : (languageSelected ? "Enter secure query..." : "Operational clearance required...")}
                        className="flex-1 bg-transparent border-none py-2 px-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#475569] focus:outline-none font-medium"
                      />
                      
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={!languageSelected || isLoading}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-cyan'}`}
                      >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>

                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading || !languageSelected || isListening}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan text-[#050812] hover:brightness-110 disabled:opacity-30 transition-all shadow-lg shadow-cyan/10"
                      >
                        <Send size={18} strokeWidth={3} />
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

