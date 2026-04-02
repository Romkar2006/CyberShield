import React from 'react';
import { motion } from 'framer-motion';
import { Shield, RadioTower, Lock, Binary, Zap, ShieldAlert } from 'lucide-react';

export const CyberHeroAnimation = () => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden rounded-3xl border border-white/[0.04] bg-[#0A0F1E] shadow-[inset_0_0_100px_rgba(0,212,255,0.05)]">
      
      {/* Deep Cyber Grid Background Texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #00D4FF 1px, transparent 1px),
            linear-gradient(to bottom, #00D4FF 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
        }}
      />

      {/* Expanding Radar Rings */}
      <motion.div 
        animate={{ scale: [0, 1.5, 3], opacity: [0.8, 0.3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[200px] h-[200px] border-[2px] border-[#00D4FF] rounded-full"
      />
      <motion.div 
        animate={{ scale: [0, 1.5, 3], opacity: [0.8, 0.3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: 2 }}
        className="absolute w-[200px] h-[200px] border-[2px] border-[#00D4FF] rounded-full"
      />
      <motion.div 
        animate={{ scale: [0, 1.5, 3], opacity: [0.8, 0.3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: 4 }}
        className="absolute w-[200px] h-[200px] border-[2px] border-[#00D4FF] rounded-full"
      />

      {/* Orbiting Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[350px] h-[350px] rounded-full border border-dashed border-[#00D4FF]/30"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#00D4FF] rounded-full shadow-[0_0_15px_rgba(0,212,255,1)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" />
      </motion.div>

      {/* Connection SVG Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
        <motion.line 
          x1="50%" y1="50%" x2="80%" y2="20%" 
          stroke="#EF4444" strokeWidth="2" strokeDasharray="6,6"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.line 
          x1="50%" y1="50%" x2="20%" y2="70%" 
          stroke="#10B981" strokeWidth="2" strokeDasharray="6,6"
          animate={{ strokeDashoffset: [0, 100] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.line 
          x1="50%" y1="50%" x2="85%" y2="75%" 
          stroke="#00D4FF" strokeWidth="1" strokeDasharray="3,3"
          animate={{ strokeDashoffset: [0, -50] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Central Core */}
      <div className="relative z-10 w-44 h-44 rounded-full bg-[#0A0F1E] border border-[#00D4FF]/50 shadow-[0_0_60px_rgba(0,212,255,0.3)] flex items-center justify-center overflow-hidden shrink-0 mt-8 mb-8 mx-auto">
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-[4px] border-[#00D4FF]/20 rounded-full border-t-[#00D4FF]"
        />
        <motion.div 
          animate={{ top: ['-20%', '120%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-1 bg-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,1)] opacity-80"
        />
        <div className="bg-[#0D1526] w-32 h-32 rounded-full flex gap-1 flex-col items-center justify-center z-20 border border-white/5 relative">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="w-12 h-12 text-[#00D4FF] drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
          </motion.div>
          <span className="text-[9px] uppercase font-bold text-[#00D4FF] tracking-widest mt-1">AI CORE</span>
        </div>
      </div>

      {/* Floating Data Nodes */}
      <motion.div 
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] right-[15%] bg-[#0D1526]/80 backdrop-blur-md border border-red-500/50 p-4 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.2)] z-20"
      >
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/40 shrink-0">
          <Binary className="text-red-500 w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Risk Level</div>
          <div className="text-sm font-mono font-bold text-red-500">CRITICAL_THREAT</div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[25%] left-[10%] bg-[#0D1526]/80 backdrop-blur-md border border-emerald-500/40 p-4 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.15)] z-20"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shrink-0">
          <Lock className="text-emerald-500 w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Secured Endpoint</div>
          <div className="text-sm font-mono font-bold text-emerald-400">ENCRYPTED_LINK</div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-[75%] right-[20%] bg-[#0D1526]/80 backdrop-blur-md border border-[#00D4FF]/30 p-3 rounded-xl flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(0,212,255,0.1)] z-20"
      >
        <Zap className="text-[#00D4FF] w-5 h-5 mb-1" />
        <span className="text-[10px] text-white font-mono">MS CPU</span>
        <span className="text-[10px] text-[#00D4FF] font-bold">14ms</span>
      </motion.div>
      
      {/* Background Decorators */}
      <div className="absolute top-8 left-8 text-[#1E293B] pointer-events-none">
        <RadioTower size={120} />
      </div>
      <div className="absolute bottom-8 right-8 text-[#1E293B] pointer-events-none">
        <ShieldAlert size={80} />
      </div>
    </div>
  );
};
