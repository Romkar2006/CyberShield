import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Zap, Search, Bookmark } from 'lucide-react';

const BNS_SECTIONS = [
  { id: '318', title: 'Cheating', context: 'Fraud/Deception involving property delivery' },
  { id: '111', title: 'Organised Cybercrime', context: 'Structured hacking and data theft networks' },
  { id: '319', title: 'Cheating by Impersonation', context: 'Identity theft using digital personas' },
  { id: '78', title: 'Stalking', context: 'Digital monitoring and harassment via devices' },
  { id: '308', title: 'Extortion', context: 'Blackmail using private data/media' },
  { id: '316', title: 'Criminal Breach of Trust', context: 'Misuse of entrusted digital assets' },
  { id: '351', title: 'Criminal Intimidation', context: 'Threats delivered via electronic channels' },
  { id: '111(2)', title: 'Organised Drug Crime', context: 'Digital marketplace narcotics trafficking' },
  { id: '352', title: 'Intentional Insult', context: 'Cyber defamation and public harassment' },
  { id: '137', title: 'Kidnapping', context: 'Abduction coordinated via digital tracking' },
  { id: '64', title: 'Sexual Assault', context: 'Coordination or facilitation of assault' },
  { id: '303', title: 'Snatching', context: 'Physical theft of mobile/digital hardware' },
  { id: '281', title: 'Rash Driving', context: 'Coordination of illegal street racing' },
  { id: '106', title: 'Death by Negligence', context: 'Automated system failures causing fatality' },
  { id: '117', title: 'Grievous Hurt', context: 'Assault resulting in permanent digital asset loss' },
  { id: '223', title: 'Public Nuisance', context: 'Digital mass-spam and service disruption' },
];

interface LogEntry {
  id: string;
  section: string;
  title: string;
  timestamp: string;
}

export const BnsTerminal = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomBns = BNS_SECTIONS[Math.floor(Math.random() * BNS_SECTIONS.length)];
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        section: `§${randomBns.id}`,
        title: randomBns.title,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setLogs(prev => [...prev.slice(-14), newLog]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-full p-1 lg:p-4 perspective-1000">
      <motion.div 
        initial={{ opacity: 0, rotateY: -10, rotateX: 5 }}
        animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
        transition={{ duration: 1 }}
        className="relative w-full h-full bg-[#050812] border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col font-['JetBrains_Mono',monospace]"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0F1E] border-b border-white/5">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-cyan animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-[#64748B] uppercase">BNS-2024 · Legal Registry Feed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
          </div>
        </div>

        {/* Tactical Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20">
           <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
        </div>

        {/* Content */}
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto scrollbar-none space-y-2 relative"
        >
          <div className="mb-4 flex items-center justify-between border-b border-cyan/10 pb-2">
            <div className="text-[9px] text-[#475569] font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap size={10} className="text-cyan" /> active legal index
            </div>
            <div className="text-[9px] text-emerald-500 shadow-sm font-black uppercase tracking-widest animate-pulse">
              SYNCED
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-4 py-0.5 group"
              >
                <span className="text-[#334155] text-[10px] font-medium shrink-0 pt-1 group-hover:text-cyan transition-colors">[{log.timestamp}]</span>
                <span className="text-cyan font-black text-xs shrink-0 pt-0.5 tracking-tighter w-14">{log.section}</span>
                <span className="text-[#94A3B8] text-xs font-bold leading-tight group-hover:text-white transition-colors underline decoration-white/5 underline-offset-4">{log.title}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Placeholder/Typing Animation */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-1.5 h-4 bg-cyan animate-pulse" />
            <div className="text-[10px] text-cyan/40 italic font-medium tracking-tight">Scanning and mapping global jurisdictions...</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0A0F1E]/80 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex flex-col">
                 <div className="text-[8px] text-[#475569] font-bold uppercase tracking-tighter mb-0.5">Neural Map Intensity</div>
                 <div className="flex gap-0.5">
                    {[...Array(8)].map((_, i) => (
                       <motion.div 
                          key={i}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-cyan rounded-[2px]" 
                       />
                    ))}
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Search size={10} className="text-[#475569]" />
              <div className="text-[8px] text-[#475569] font-black uppercase tracking-widest">v2.04.1 (BNS_2024_INDIA)</div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
