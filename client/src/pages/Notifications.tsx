import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Info, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';

export const Notifications = () => {
  const notifs = [
    {
      id: 1,
      type: 'alert',
      title: 'Action Required: Statement Verificiation',
      desc: 'The investigating officer for FIR-X9K2M4P1L has requested additional transaction screenshots.',
      date: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Status Update',
      desc: 'Your case FIR-X9K2M4P1L has been flagged as "Under Investigation" by the regional cyber cell.',
      date: '1 day ago',
      read: true
    },
    {
      id: 3,
      type: 'success',
      title: 'Account Verification Complete',
      desc: 'Your CyberShield ID has been verified against the DigiLocker registry.',
      date: '1 week ago',
      read: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="text-red-500" size={20} />;
      case 'info': return <Info className="text-[#00D4FF]" size={20} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Notifications <span className="bg-[#00D4FF] text-[#0A0F1E] text-sm px-2.5 py-1 rounded-full ml-2 align-middle font-bold">1 New</span></h1>
            <p className="text-[#94A3B8]">Alerts regarding your cases and security bulletins.</p>
          </div>
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[#94A3B8]">
            <Settings size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {notifs.map((n, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={n.id}
              className={`bg-[#0D1526] border rounded-xl p-5 flex gap-5 items-start ${n.read ? 'border-white/[0.08] opacity-70' : 'border-[#00D4FF]/30 shadow-[0_0_20px_rgba(0,212,255,0.05)]'}`}
            >
              <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${n.read ? 'bg-[#0A0F1E] border border-white/10' : 'bg-[#00D4FF]/10 border border-[#00D4FF]/30'}`}>
                {getIcon(n.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold ${n.read ? 'text-[#E2E8F0]' : 'text-white'}`}>{n.title}</h3>
                  <span className="text-xs text-[#64748B] font-mono">{n.date}</span>
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-3">
                  {n.desc}
                </p>
                
                {!n.read && (
                  <button className="text-xs font-bold text-[#00D4FF] flex items-center gap-1 hover:underline uppercase tracking-wider">
                    Take Action <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
