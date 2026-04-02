import React, { useEffect, useState } from 'react';
import { getAllAlerts, createAlert, toggleAlert } from '../lib/api';
import { ScamAlert } from '../types';
import { AlertCircle, Plus, ShieldAlert, Power, Activity, RefreshCw } from 'lucide-react';
import { PageLoader } from '../components/shared/PageLoader';

export const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [scamType, setScamType] = useState('Phishing');
  const [cities, setCities] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await getAllAlerts();
      setAlerts(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load scam alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return setError('Title and description are required');

    try {
      setSubmitting(true);
      setError('');

      const parsedCities = cities.split(',').map(c => c.trim()).filter(Boolean);

      const res = await createAlert({
        title,
        description,
        severity,
        scam_type: scamType,
        affected_cities: parsedCities,
      });

      setAlerts([res.data, ...alerts]);
      // Reset form
      setTitle('');
      setDescription('');
      setCities('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setAlerts(alerts.map(a => a._id === id ? { ...a, is_active: !currentStatus } : a));
      await toggleAlert(id);
    } catch (err) {
      // Revert if failed
      setAlerts(alerts.map(a => a._id === id ? { ...a, is_active: currentStatus } : a));
      alert('Failed to toggle alert status.');
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex flex-col gap-8">
        {/* Header removed and handled by global AdminHeader */}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Create Alert Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#0D1526] border border-white/[0.06] rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-[#00D4FF]">
              <ShieldAlert size={20} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Issue Broadcast</h2>
            </div>

            <form onSubmit={handleCreateAlert} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. KYC Update Phishing (SMS)"
                  className="bg-[#0A0F1E] border border-white/[0.1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#00D4FF] transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Detailed Warning</label>
                <textarea
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the scam modus operandi..."
                  className="bg-[#0A0F1E] border border-white/[0.1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#00D4FF] transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Scam Type</label>
                  <select
                    value={scamType}
                    onChange={e => setScamType(e.target.value)}
                    className="bg-[#0A0F1E] border border-white/[0.1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#00D4FF] transition"
                  >
                    <option>Phishing</option>
                    <option>UPI Fraud</option>
                    <option>Identity Theft</option>
                    <option>Loan App Extortion</option>
                    <option>Investment Scam</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="bg-[#0A0F1E] border border-white/[0.1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#00D4FF] transition"
                  >
                    <option value="Critical">Critical (Red)</option>
                    <option value="High">High (Amber)</option>
                    <option value="Medium">Medium (Cyan)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Affected Cities (Comma separated)</label>
                <input
                  type="text"
                  value={cities}
                  onChange={e => setCities(e.target.value)}
                  placeholder="Delhi, Mumbai, Bangalore"
                  className="bg-[#0A0F1E] border border-white/[0.1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#00D4FF] transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 bg-[#00D4FF] hover:bg-[#00BBDD] text-[#0A0F1E] font-bold uppercase tracking-widest py-3 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50 shadow-[0_4px_20px_rgba(0,212,255,0.2)]"
              >
                {submitting ? <RefreshCw size={18} className="animate-spin" /> : <><Plus size={18} strokeWidth={3} /> COMPILE ALERT</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Alerts Database */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-[#0D1526] border border-white/[0.06] rounded-xl flex flex-col overflow-hidden h-full shadow-xl relative">

            {loading && !alerts.length ? (
              <div className="absolute inset-0 z-10 bg-[#0D1526]/80 flex items-center justify-center">
                <PageLoader />
              </div>
            ) : null}

            <div className="p-5 border-b border-white/[0.04] flex items-center justify-between bg-[#0F172A]/50">
              <div className="flex items-center gap-2 text-white">
                <Activity size={18} className="text-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Alert Registry</h2>
              </div>
              <span className="text-xs font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-1 rounded">
                {alerts.length} Total Records
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div className="flex flex-col gap-4">
                {alerts.length === 0 && !loading && (
                  <div className="text-center text-[#64748B] text-sm py-10">No scam alerts found in the database.</div>
                )}

                {alerts.map((alert) => (
                  <div key={alert._id} className={`flex items-start md:items-center justify-between p-5 rounded-xl border transition-all ${alert.is_active
                      ? 'bg-red-500/[0.03] border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)] shadow-inner'
                      : 'bg-[#0A0F1E] border-white/[0.06] opacity-75 grayscale-[30%]'
                    }`}>

                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-base font-bold ${alert.is_active ? 'text-white' : 'text-[#94A3B8]'}`}>{alert.title}</h3>
                        {alert.is_active ? (
                          <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            LIVE
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                            INACTIVE
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[#94A3B8] max-w-xl line-clamp-2 md:line-clamp-none mb-2">{alert.description}</p>

                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-1 rounded border border-[#00D4FF]/20">
                          {alert.scam_type}
                        </span>

                        {alert.affected_cities && alert.affected_cities.length > 0 && (
                          <span className="text-[10px] font-bold text-[#64748B] bg-white/5 border border-white/5 shadow-inner px-2 py-1 rounded">
                            📍 {alert.affected_cities.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-3 shrink-0">
                      <button
                        onClick={() => handleToggle(alert._id, alert.is_active)}
                        className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${alert.is_active ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#1E293B]'
                          }`}
                      >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${alert.is_active ? 'left-8 shadow-sm' : 'left-1'
                          }`}></div>
                      </button>

                      {alert.published_at && (
                        <div className="text-[10px] text-[#64748B] font-mono whitespace-nowrap">
                          {new Date(alert.published_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
      </div>
    </div>
  );
};
