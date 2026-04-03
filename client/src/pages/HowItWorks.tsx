import React from 'react';
import { motion } from 'framer-motion';
import { Languages, BrainCircuit, Scale, Zap, FileSearch } from 'lucide-react';
import { isUserLoggedIn } from '../lib/auth';
import { useAuthModal } from '../components/layout/AuthContext';
import { useNavigate } from 'react-router-dom';

export const HowItWorks = () => {
  const navigate = useNavigate();
  const { showAuthModal } = useAuthModal();
  const steps = [
    {
      icon: <Languages className="w-8 h-8 text-[#00D4FF]" />,
      title: 'Multilingual Intake',
      desc: 'Victims can file complaints in Hindi, English, or Hinglish. Our NLP engine instantly detects the language and standardizes the text for processing without losing crucial context.',
      color: 'from-[#00D4FF]/20 to-transparent',
      borderColor: 'border-[#00D4FF]/30'
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-purple-400" />,
      title: 'Zephyr 7B AI Analysis',
      desc: 'The standardized text is fed into a HuggingFace Inference pipeline powered by Zephyr-7b. The AI extracts critical entities: UPI IDs, phone numbers, crypto wallets, and URLs.',
      color: 'from-purple-500/20 to-transparent',
      borderColor: 'border-purple-500/30'
    },
    {
      icon: <Scale className="w-8 h-8 text-red-400" />,
      title: 'BNS 2024 Legal Mapping',
      desc: 'Based on the extracted modus operandi, CyberShield maps the incident to the exact clauses of the new Bharatiya Nyaya Sanhita (BNS 2024) replacing the old IPC/IT Act.',
      color: 'from-red-500/20 to-transparent',
      borderColor: 'border-red-500/30'
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      title: 'Smart Routing & Escalation',
      desc: 'The complaint is assigned a severity score (Critical/High/Medium/Low) and instantly routed to the relevant city Cyber Cell. If critical, SMS escalations are blasted.',
      color: 'from-amber-500/20 to-transparent',
      borderColor: 'border-amber-500/30'
    },
    {
      icon: <FileSearch className="w-8 h-8 text-emerald-400" />,
      title: 'FIR Generation & Tracking',
      desc: 'A professional FIR document is compiled in PDF format and emailed to the victim. The victim receives a tracking Ref No to monitor live investigation progress.',
      color: 'from-emerald-500/20 to-transparent',
      borderColor: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 flex justify-center">
        <div className="w-full max-w-7xl h-full border-x border-white/[0.05] relative flex justify-evenly">
          <div className="w-px h-full bg-white/[0.05]"></div>
          <div className="w-px h-full bg-white/[0.05]"></div>
          <div className="w-px h-full bg-white/[0.05]"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header Hero */}
        <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            System Architecture
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#0099BB]">CyberShield</span> Processes Cybercrime
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed"
          >
            From natural language victim reports to legally mapped, routed FIR documents in <strong>under 15 seconds</strong>. Here is our inference pipeline.
          </motion.p>
        </div>

        {/* Pipeline Container */}
        <div className="max-w-4xl mx-auto px-6 pb-32">
          <div className="relative">
            {/* The Central Line */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-white/[0.05] -translate-x-1/2 rounded-full overflow-hidden">
              <motion.div 
                className="w-full bg-gradient-to-b from-transparent via-[#00D4FF] to-transparent h-1/3"
                animate={{
                  y: ["-100%", "300%"]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "linear"
                }}
              />
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-12 md:gap-24 relative">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Content Half */}
                    <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                      <div className={`w-full md:max-w-md bg-[#0D1526] border ${step.borderColor} p-8 rounded-2xl relative overflow-hidden group hover:bg-[#0F172A] transition-colors shadow-2xl shadow-black/50`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="text-[10px] font-black text-white/20 text-4xl leading-none">0{index + 1}</div>
                            {step.icon}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                          <p className="text-[#94A3B8] text-sm leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Center Node dot */}
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-[#0A0F1E] border-2 border-[#00D4FF] -translate-x-1/2 z-10 shadow-[0_0_10px_rgba(0,212,255,0.5)]"></div>
                    
                    {/* Empty Half placeholder for desktop flex */}
                    <div className="hidden md:block w-1/2"></div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="border-t border-white/[0.05] bg-[#0A101D] py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to report an incident?</h2>
            <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
              Our AI pipeline is active 24/7. Filing a report takes less than 3 minutes.
            </p>
            <button 
              onClick={() => isUserLoggedIn() ? navigate('/complaint') : showAuthModal()} 
              className="bg-[#00D4FF] text-[#0A0F1E] font-bold px-8 py-3 rounded-lg hover:bg-[#00BBDD] transition shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
            >
              FILE POLICE COMPLAINT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
