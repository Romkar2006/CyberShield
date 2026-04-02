import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Search, BarChart2, 
  Map as MapIcon, Network, AlertTriangle, BookOpen, 
  Settings, LogOut, Zap, Shield, User as UserIcon
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';

import { getToken, removeToken } from '../../lib/auth';

export const AdminLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  // ── Auth Guard ────────────────────────────────────────────────
  const token = getToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    removeToken();
    window.location.href = '/admin/login';
  };

  const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
    { icon: FileText, label: 'Complaints', to: '/admin/cases' },
    { icon: BarChart2, label: 'Analytics', to: '/analytics' },
    { icon: MapIcon, label: 'Heatmap', to: '/heatmap' },
    { icon: Network, label: 'Fraud Network', to: '/fraud-network' },
    { icon: AlertTriangle, label: 'Alerts', to: '/admin/alerts' },
    { icon: BookOpen, label: 'Knowledge Hub', to: '/admin/articles' }
  ];

  return (
    <div className="flex h-screen bg-[#0A0F1E] overflow-hidden font-sans transition-colors duration-300 text-white">
      {/* Sidebar - Always Dark */}
      <aside className="w-[260px] bg-[#0E1525] border-r border-white/5 flex flex-col shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.3)] z-[110]">
        <div className="p-8 flex flex-col gap-2">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-dark/10 flex items-center justify-center border border-cyan-dark/20 group-hover:border-cyan-dark transition-all">
              <Shield className="w-6 h-6 text-cyan-dark animate-pulse" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter uppercase font-['Outfit',sans-serif]">CyberShield</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#475569] font-black ml-12">SOC HQ</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-4">
          <div className="text-[9px] font-black text-[#475569] uppercase tracking-[0.2em] mb-4 ml-4">Command Modules</div>
          {menu.map(item => {
            const active = path === item.to || (item.to !== '/admin' && path.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all group ${
                active 
                  ? 'bg-cyan-dark/10 text-cyan-dark border border-cyan-dark/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                  : 'text-[#64748B] hover:text-white hover:bg-white/5 border border-transparent'
              }`}>
                <item.icon size={16} className={active ? 'text-cyan-dark' : 'text-[#475569] group-hover:text-cyan-dark transition-colors'} />
                {item.label}
              </Link>
            );
          })}
          
          <div className="mt-8 mb-4 flex items-center gap-2 px-4">
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="text-[9px] font-black text-[#475569] uppercase tracking-[0.2em]">Personnel</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          
          <Link to="/admin/profile" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all hover:bg-white/5 group ${path === '/admin/profile' ? 'bg-cyan-dark/10 text-cyan-dark border border-cyan-dark/30' : 'text-[#64748B] hover:text-white'}`}>
            <UserIcon size={16} className={path === '/admin/profile' ? 'text-cyan-dark' : 'text-[#475569] group-hover:text-cyan-dark'} />
            Bureau Profile
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all group">
            <LogOut size={16} className="text-red-500/40 group-hover:text-red-400" />
            Logout
          </button>
        </nav>

        {/* Emergency Response Fixed Bottom */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <button className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 p-4 rounded-2xl text-white font-black text-[10px] tracking-widest uppercase hover:brightness-110 shadow-[0_10px_20px_rgba(99,102,241,0.3)] transition-all active:scale-95 group">
            <Zap size={16} fill="currentColor" className="group-hover:animate-bounce" />
            RED ALERT OPS
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0A0F1E]">
        <AdminHeader />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-12 px-8 py-6">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
