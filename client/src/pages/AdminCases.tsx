import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, AlertCircle, RefreshCw, Activity, Archive } from 'lucide-react';
import { getComplaints } from '../lib/api';
import { Complaint } from '../types';
import { PageLoader } from '../components/shared/PageLoader';

export const AdminCases = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  
  // Folder View State
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await getComplaints({ 
        page, 
        limit: 10,
        search: searchTerm,
        status: viewMode === 'RESOLVED' ? 'RESOLVED' : statusFilter,
        severity: severityFilter
      });
      
      // Filter out RESOLVED cases from ACTIVE view if status filter is NONE
      let results = res.data.complaints || [];
      if (viewMode === 'ACTIVE' && statusFilter === 'ALL') {
        results = results.filter((c: any) => c.status !== 'RESOLVED');
      }
      
      setComplaints(results);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(viewMode === 'ACTIVE' ? (res.data.totalCount - (res.data.resolvedCount || 0)) : (res.data.resolvedCount || 0));
      setError('');
    } catch (err: any) {
      console.error('[SOC-ERROR] Record sync failure:', err);
      setError(err.response?.data?.error || 'Failed to connect to investigations database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, severityFilter]);

  // Handle search with a small delay or manual trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on search
      fetchCases();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Critical</span>;
      case 'High': return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">High</span>;
      case 'Medium': return <span className="bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Medium</span>;
      case 'Low': return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Low</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED': return <span className="bg-slate-800 text-slate-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-slate-700">Received</span>;
      case 'ASSIGNED': return <span className="bg-blue-900/40 text-blue-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-blue-800/50">Assigned</span>;
      case 'UNDER_INVESTIGATION': return (
        <span className="bg-purple-900/40 text-purple-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase flex items-center gap-1.5 border border-purple-800/50 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
          Under Investigation
        </span>
      );
      case 'RESOLVED': return <span className="bg-emerald-900/40 text-emerald-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-emerald-800/50">Resolved</span>;
      default: return <span className="text-slate-500">{status}</span>;
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.ref_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.victim_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="w-full relative flex flex-col gap-6">
      
      {/* ── FOLDER NAVIGATION ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setViewMode('ACTIVE'); setPage(1); setStatusFilter('ALL'); }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${viewMode === 'ACTIVE' ? 'border-[#00D4FF] text-white' : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'}`}
          >
            <Activity size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Investigations</span>
          </button>
          <button 
            onClick={() => { setViewMode('RESOLVED'); setPage(1); setStatusFilter('RESOLVED'); }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${viewMode === 'RESOLVED' ? 'border-[#00D4FF] text-white' : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'}`}
          >
            <Archive size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Resolved Records</span>
          </button>
        </div>
        
        <div className="text-[9px] text-[#475569] font-bold uppercase tracking-widest mt-0.5">
          {viewMode === 'ACTIVE' ? 'Live Forensic Feed' : 'Historical Audit Sync'} Active
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-end">
        <div className="md:col-span-6 relative">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-2 block">Universal Search</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Search by FIR ID, Victim Name, or City hub..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D1526] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-dark transition shadow-inner"
            />
          </div>
        </div>
        
        <div className="md:col-span-3">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-2 block">Workflow Filter</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0D1526] border border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-sm focus:outline-none focus:border-cyan-dark transition appearance-none text-white cursor-pointer font-bold uppercase tracking-tight"
            >
              <option value="ALL">All Lifecycles</option>
              <option value="RECEIVED">Received</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">▼</div>
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-2 block">Threat Severity</label>
          <div className="relative">
            <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#0D1526] border border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-sm focus:outline-none focus:border-cyan-dark transition appearance-none text-white cursor-pointer font-bold uppercase tracking-tight"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Threat</option>
              <option value="Low">Low Priority</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">▼</div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle size={20} />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Table Area */}
      <div className="bg-[#0D1526] border border-white/[0.06] rounded-xl flex flex-col overflow-hidden flex-1 relative">
        {loading && !complaints.length ? (
          <div className="absolute inset-0 bg-[#0A0F1E]/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <PageLoader />
          </div>
        ) : null}

        <div className="overflow-x-auto flex-1 h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-[#0F172A] border-b border-white/[0.06] shadow-sm">
              <tr>
                <th className="py-4 px-6 text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider w-[120px]">Ref No</th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider">Filing Date</th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider">Victim / City</th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider text-center">Severity</th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {!loading && complaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B] text-sm">
                    No complaints found matching your filters.
                  </td>
                </tr>
              )}
              {complaints.map((comp) => (
                <tr key={comp.ref_no} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <td className="py-4 px-6 text-sm font-mono text-[#94A3B8]">{comp.ref_no}</td>
                  <td className="py-4 px-6 text-sm text-[#94A3B8]">{new Date(comp.createdAt!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-semibold text-white">{comp.victim_name || 'Anonymous'}</div>
                    <div className="text-xs text-[#64748B]">{comp.city || 'Unknown Location'}</div>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-white">
                    {comp.categories && comp.categories.length > 0 ? comp.categories[0] : 'Unclassified'}
                    {comp.categories && comp.categories.length > 1 && <span className="ml-2 text-[10px] text-[#64748B] bg-white/5 px-1.5 py-0.5 rounded">+{comp.categories.length - 1}</span>}
                  </td>
                  <td className="py-4 px-6 text-center">{getSeverityBadge(comp.severity)}</td>
                  <td className="py-4 px-6">{getStatusBadge(comp.status)}</td>
                  <td className="py-4 px-6 text-right">
                    <Link to={`/admin/case/${comp.ref_no}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#00D4FF] text-xs font-semibold bg-[#00D4FF]/10 px-3 py-1.5 rounded hover:bg-[#00D4FF]/20">
                      Investigate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLLER ── */}
        <div className="bg-[#0F172A] border-t border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
            Showing Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${page === pageNum ? 'bg-[#00D4FF] border-[#00D4FF] text-[#0A0F1E]' : 'bg-[#0A0F1E] border-white/10 text-[#64748B] hover:text-white hover:border-white/20'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-[#64748B] mx-1">...</span>}
            </div>

            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-[10px] font-bold uppercase tracking-widest hover:bg-[#00D4FF]/20 disabled:opacity-30 transition-all flex items-center gap-2"
            >
              Next Page <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
