import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ShieldAlert, ArrowRight, UserPlus, X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../layout/AuthContext';

export const AuthRequiredModal = () => {
  const { isAuthModalOpen, hideAuthModal } = useAuthModal();
  const navigate = useNavigate();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  const handleLoginClick = () => {
    hideAuthModal();
    navigate('/login');
  };

  if (!isAuthModalOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={hideAuthModal}
           className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 30 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 30 }}
           className="relative w-full max-w-lg bg-[#0D1526] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,212,255,0.2)]"
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-dark via-[#7C3AED] to-cyan-dark"></div>

          {/* Close button */}
          <button 
             onClick={hideAuthModal}
             className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#64748B] hover:text-white hover:bg-white/10 transition-all z-20"
          >
             <X size={18} className="sm:w-5 sm:h-5" />
          </button>

          <div className="p-6 sm:p-10">
             {/* Icon Cluster */}
             <div className="flex justify-center mb-6 sm:mb-10">
                <div className="relative">
                   <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] bg-cyan-dark/10 border border-cyan-dark/20 flex items-center justify-center text-cyan-dark">
                      <Shield size={36} className="sm:size-11 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0D1526] border border-white/10 flex items-center justify-center text-emerald-400">
                      <Lock size={16} />
                   </div>
                </div>
             </div>

             {/* Texts */}
             <div className="text-center mb-8 sm:mb-10">
                <div className="text-[9px] sm:text-[10px] font-black text-cyan-dark uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-2 sm:mb-3">Identification Required</div>
                <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight mb-3 sm:mb-4">Securing the <span className="text-cyan-dark not-italic">Digital Perimeter</span></h2>
                <div className="h-0.5 w-12 sm:w-16 bg-white/10 mx-auto mb-5 sm:mb-6"></div>
                <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed px-2 sm:px-4">
                   To file a report, track your case, or access the full intelligence dashboard, 
                   you must authenticate your identity. This protocol ensures the integrity 
                   of our cyber-forensic environment.
                </p>
             </div>

             {/* Actions */}
             <div className="flex flex-col gap-3 sm:gap-4">
                <button 
                   onClick={handleLoginClick}
                   className="w-full h-14 sm:h-16 bg-cyan-dark text-[#0A0F1E] rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center justify-center gap-2 sm:gap-3 hover:brightness-110 shadow-[0_4px_20px_rgba(0,212,255,0.2)] transition-all active:scale-[0.98] group"
                >
                   <LogIn size={18} /> Authenticate Access <ArrowRight size={16} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                   onClick={() => { hideAuthModal(); navigate('/login'); }}
                   className="w-full h-14 sm:h-16 bg-white/5 border border-white/5 hover:border-white/20 text-[#64748B] hover:text-white rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all flex items-center justify-center gap-2"
                >
                   <UserPlus size={18} /> New Investigator?
                </button>
             </div>

             {/* Footer disclaimer */}
             <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/[0.05] flex items-center justify-center gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-bold text-[#475569] uppercase tracking-widest">
                <ShieldAlert size={12} className="text-cyan-dark/50" />
                Case Encryption Layer Active — CyberShield India
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
