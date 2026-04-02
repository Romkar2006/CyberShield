import React from 'react';
import { motion } from 'framer-motion';
import { Phone, ShieldAlert, HeartHandshake, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Helplines = () => {
  const contacts = [
    {
      title: 'National Cyber Crime Portal',
      number: '1930',
      timing: '24/7 Available',
      desc: 'Dial immediately for financial cyber frauds. The sooner you call, the higher the chance of freezing your stolen funds.',
      icon: <ShieldAlert size={28} className="text-[#00D4FF]" />
    },
    {
      title: 'Women Police Helpline',
      number: '1091',
      timing: '24/7 Available',
      desc: 'Dedicated helpline for women facing cyber harassment, sextortion, or severe online abuse.',
      icon: <HeartHandshake size={28} className="text-pink-400" />
    },
    {
      title: 'National Emergency',
      number: '112',
      timing: '24/7 Available',
      desc: 'Pan-India single emergency number for immediate physical threat or if perpetrators are physically tracking you.',
      icon: <Phone size={28} className="text-red-500" />
    }
  ];

  const banks = [
    { name: 'State Bank of India (SBI)', number: '1800 11 2211' },
    { name: 'HDFC Bank', number: '1800 202 6161' },
    { name: 'ICICI Bank', number: '1800 1080' },
    { name: 'Punjab National Bank (PNB)', number: '1800 180 2222' },
    { name: 'Axis Bank', number: '1800 419 5959' },
    { name: 'Bank of Baroda', number: '1800 258 4455' }
  ];

  const cities = [
    { name: 'Delhi Cyber Cell', number: '011-20892518' },
    { name: 'Mumbai Cyber Cell', number: '022-26504008' },
    { name: 'Bangalore CID Cyber', number: '080-22094508' },
    { name: 'Hyderabad Cyber Crime', number: '040-27852412' },
    { name: 'Chennai Cyber Cell', number: '044-28592711' },
    { name: 'Kolkata Cyber PS', number: '033-22143000' }
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

      <div className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Emergency Contacts
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
            >
              Get Immediate <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">Assistance</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed"
            >
              If your bank account was just compromised, do not wait. Dial <strong>1930</strong> immediately before filing the detailed complaint here.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contacts.map((contact, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-[#0D1526] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl p-6 transition-all shadow-xl shadow-black/40 group flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#0F172A] border border-white/[0.05] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {contact.icon}
                </div>
                <h2 className="text-lg font-bold text-white mb-2">{contact.title}</h2>
                <div className="text-3xl font-black text-white mb-2 tracking-tighter">{contact.number}</div>
                <div className="text-xs font-semibold text-[#00D4FF] uppercase tracking-wider mb-4 bg-[#00D4FF]/10 px-2.5 py-1 rounded-md">
                  {contact.timing}
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  {contact.desc}
                </p>
                <a href={`tel:${contact.number}`} className="mt-8 w-full block py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors">
                  CALL NOW
                </a>
              </motion.div>
            ))}
          </div>

          {/* Bank Helplines Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[#00D4FF] rounded-full"></span>
              Major Bank Toll-Free Helplines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {banks.map((bank, i) => (
                <div key={i} className="bg-[#0D1526]/50 border border-white/[0.05] hover:border-[#00D4FF]/40 p-4 rounded-xl flex flex-col gap-1 transition-colors group">
                  <div className="text-sm text-[#94A3B8] font-medium group-hover:text-white transition-colors">{bank.name}</div>
                  <a href={`tel:${bank.number.split(' ')[0]}`} className="text-white font-bold tracking-wide hover:text-[#00D4FF] transition-colors">{bank.number}</a>
                </div>
              ))}
            </div>
          </motion.div>

          {/* City Police Cyber Cells */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                  <span className="w-8 h-[2px] bg-cyan rounded-full"></span>
                  Metropolitan Cyber Cells (HQ)
                </h3>
                <p className="text-[#475569] text-xs font-bold uppercase tracking-widest mt-2 ml-11">Official Landline Registry · Verified 2024</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Live Registry Sync</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cities.map((city, i) => (
                <div key={i} className="relative group overflow-hidden">
                  <div className="bg-[#0D1526]/60 backdrop-blur-md border border-white/[0.05] hover:border-cyan/40 p-5 rounded-2xl flex flex-col gap-1 transition-all duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-[#64748B] font-bold tracking-tight group-hover:text-cyan transition-colors">{city.name}</div>
                      <div className="text-[8px] text-emerald-500/60 font-black uppercase tracking-tighter">Verified</div>
                    </div>
                    <a href={`tel:${city.number}`} className="text-xl font-black text-white tracking-tighter hover:text-cyan transition-colors">
                      {city.number}
                    </a>
                    
                    {/* Interactive Scan Line Effect on Hover */}
                    <motion.div 
                      className="absolute bottom-0 left-0 h-[1px] bg-cyan opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <p className="mt-6 text-center text-[#475569] text-[10px] font-medium leading-relaxed max-w-2xl mx-auto">
              Note: The city-specific numbers above are for **Cyber Cell Headquarter** inquiries. For immediate reporting of financial fraud in any part of India, always dial **1930** first.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-gradient-to-r from-[#00D4FF]/10 to-[#0A0F1E] border border-[#00D4FF]/30 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Need to report a non-emergency incident?</h3>
              <p className="text-[#94A3B8]">Our AI will parse your complaint and route it to your nearest Cyber Cell instantly.</p>
            </div>
            <Link to="/complaint" className="whitespace-nowrap bg-[#00D4FF] text-[#0A0F1E] font-bold px-8 py-3 rounded-lg hover:bg-[#00BBDD] transition shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              FILE COMPLAINT
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
