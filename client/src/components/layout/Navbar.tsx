import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, User, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdmin, removeToken, isUserLoggedIn } from '../../lib/auth';
import { useAuthModal } from './AuthContext';

export const Navbar = () => {
  const { showAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const admin = isAdmin();

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/helplines', label: 'Helplines' },
    { to: '/hub', label: 'Knowledge Hub' },
    { to: '/assistant', label: 'Voice Assistant' }
  ];

  // Mobile menu rendered via Portal to escape sticky nav stacking context
  const mobileMenuPortal = ReactDOM.createPortal(
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Full-screen backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            className="bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-in drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999, width: '80%', maxWidth: '300px' }}
            className="bg-[#0D1526] border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="CyberShield" className="w-7 h-7 object-contain" />
                <span className="text-sm font-black text-white tracking-widest uppercase italic">
                  Cyber<span className="text-[#00D4FF] not-italic">Shield</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-[9px] font-black text-[#475569] uppercase tracking-[0.4em] px-4 mb-3">Navigation</p>
              <div className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/5 text-white font-semibold text-sm group transition-all"
                  >
                    {link.label}
                    <ChevronRight
                      size={15}
                      className="text-[#00D4FF] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                ))}

                {/* Track Case link */}
                {isUserLoggedIn() ? (
                  <Link
                    to="/status"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3.5 rounded-xl hover:bg-[#00D4FF]/10 text-[#00D4FF] font-semibold text-sm transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                    Track Case
                  </Link>
                ) : !admin && (
                  <button
                    onClick={() => { showAuthModal(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-3.5 rounded-xl hover:bg-[#00D4FF]/10 text-[#00D4FF] font-semibold text-sm transition-all w-full text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                    Track Case
                  </button>
                )}
              </div>
            </div>

            {/* CTA Buttons at bottom */}
            <div className="px-4 py-6 border-t border-white/5 flex flex-col gap-3">
              {admin ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-xl text-[#00D4FF] font-black text-xs tracking-widest uppercase text-center"
                  >
                    Admin Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3.5 border border-red-500/20 text-red-400 font-black text-xs tracking-widest uppercase rounded-xl hover:bg-red-500/10 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : isUserLoggedIn() ? (
                <>
                  <Link
                    to="/complaint"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 bg-[#00D4FF] text-[#0A0F1E] rounded-xl font-black text-xs tracking-widest uppercase text-center shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                  >
                    File Complaint
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-black text-xs tracking-widest uppercase text-center"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-black text-xs tracking-widest uppercase text-center"
                    >
                      Dashboard
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3.5 border border-red-500/20 text-red-400 font-black text-xs tracking-widest uppercase rounded-xl hover:bg-red-500/10 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { showAuthModal(); setIsMobileMenuOpen(false); }}
                    className="w-full py-3.5 bg-[#00D4FF] text-[#0A0F1E] rounded-xl font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                  >
                    File Complaint
                  </button>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-black text-xs tracking-widest uppercase text-center"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      <nav className="sticky top-0 z-[200] h-[64px] bg-[#0A0F1E]/95 backdrop-blur-md border-b border-white/[0.06] w-full flex justify-center">
        <div className="w-full max-w-[1280px] h-full flex items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 group-hover:scale-110">
              <div className="absolute inset-0 bg-[#00D4FF]/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/logo.png"
                alt="CyberShield Logo"
                className="relative w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              />
            </div>
            <span className="text-xl font-black text-white hidden sm:block tracking-tighter uppercase italic">
              Cyber<span className="text-[#00D4FF] not-italic">Shield</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isUserLoggedIn() ? (
              <Link
                to="/status"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#00D4FF] hover:opacity-80 transition-opacity"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
                Track Case
              </Link>
            ) : !admin && (
              <button
                onClick={showAuthModal}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#00D4FF] hover:opacity-80 transition-opacity"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
                Track Case
              </button>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {admin ? (
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-[#94A3B8]">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <div className="relative group">
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    <User size={16} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0D1526] border border-white/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col items-start overflow-hidden py-1 text-sm">
                    <Link to="/admin" className="w-full text-left px-4 py-2 hover:bg-white/5 text-white">Dashboard</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-white/5 text-red-400">Logout</button>
                  </div>
                </div>
              </div>
            ) : isUserLoggedIn() ? (
              <div className="flex items-center gap-3">
                <Link to="/complaint" className="px-4 py-2 text-sm font-medium rounded-lg bg-[#00D4FF] text-[#0A0F1E] hover:brightness-110 shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all">
                  File Complaint
                </Link>
                <Link to="/dashboard" className="text-sm font-medium text-[#94A3B8] hover:text-white pr-2">Dashboard</Link>
                <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                  <User size={16} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg border border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all">
                  Login
                </Link>
                <button
                  onClick={showAuthModal}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[#00D4FF] text-[#0A0F1E] hover:brightness-110 shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
                >
                  File Complaint
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Portal — renders outside nav stacking context */}
      {mobileMenuPortal}
    </>
  );
};
