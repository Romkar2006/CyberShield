import React, { useState } from 'react';
import { Shield, Save, User, FileText, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { updateCaseStatus } from '../../lib/api';
import { CaseStatus, Complaint } from '../../types';

interface Props {
  complaint: Complaint;
  onUpdate: (updated: Complaint) => void;
}

export const CaseControlPanel = ({ complaint, onUpdate }: Props) => {
  const [status, setStatus] = useState<CaseStatus>(complaint.status);
  const [officer, setOfficer] = useState(complaint.assigned_officer || '');
  const [department, setDepartment] = useState(complaint.department || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setMessage({ type: 'error', text: 'Please add a progress note' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await updateCaseStatus({
        ref_no: complaint.ref_no,
        status,
        assigned_officer: officer,
        department,
        note
      });
      onUpdate(res.data);
      setNote('');
      setMessage({ type: 'success', text: 'Case updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions: { value: CaseStatus; label: string; description: string }[] = [
    { value: 'RECEIVED', label: 'Received', description: 'New complaint filed, awaiting review' },
    { value: 'ASSIGNED', label: 'Assigned', description: 'Officer assigned to the case' },
    { value: 'UNDER_INVESTIGATION', label: 'Investigation', description: 'Active forensic/field work in progress' },
    { value: 'RESOLVED', label: 'Resolved', description: 'Case closed, FIR finalized' }
  ];

  return (
    <div className="bg-[#0D1526] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      <div className="p-4 border-b border-white/[0.06] bg-[#0F172A]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-cyan-dark" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Officer Action Hub</h2>
        </div>
        {complaint.status === 'RESOLVED' && (
           <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
             <CheckCircle size={10} /> CASE CLOSED
           </span>
        )}
      </div>

      <form onSubmit={handleUpdate} className="p-5 flex flex-col gap-5 flex-1 overflow-y-auto">
        {/* Status Selection */}
        <div>
          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3 block">Update Workflow Status</label>
          <div className="grid grid-cols-1 gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left group ${
                  status === opt.value
                    ? 'bg-cyan-dark/10 border-cyan-dark/50 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'bg-white/5 border-white/5 text-[#94A3B8] hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    status === opt.value 
                      ? 'bg-cyan-dark shadow-[0_0_8px_rgba(34,211,238,1)]' 
                      : 'bg-[#64748B]'
                  }`}></div>
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wide ${status === opt.value ? 'text-cyan-dark' : ''}`}>{opt.label}</div>
                    <div className="text-[10px] text-[#64748B] font-medium leading-tight mt-0.5">{opt.description}</div>
                  </div>
                </div>
                {status === opt.value && <ChevronRight size={14} className="text-cyan-dark" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Assigned Officer */}
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2 block font-['Outfit',sans-serif]">Principal Investigator</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                placeholder="e.g. Insp. Vikram Singh"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-dark transition uppercase"
              />
            </div>
          </div>

          {/* Department / Region */}
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2 block font-['Outfit',sans-serif]">Assigned Department / Region</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cyber Crime Cell, Bengaluru"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-dark transition uppercase"
              />
            </div>
          </div>
        </div>

        {/* Action Note */}
        <div className="flex-1 min-h-[120px] flex flex-col">
          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2 block font-['Outfit',sans-serif]">Official Investigation Note</label>
          <div className="relative flex-1">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detail the progress or evidence found..."
              className="w-full h-full min-h-[100px] bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-dark transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {message.text && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-bold uppercase tracking-wide border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-dark hover:bg-cyan-dark/90 text-dark-bg-sidebar font-black py-4 rounded-xl flex justify-center items-center gap-2 transition transform active:scale-[0.98] shadow-[0_4px_20px_rgba(0,212,255,0.2)] disabled:opacity-50 uppercase tracking-widest text-xs"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin"></div>
          ) : (
            <>
              COMMIT CHANGES <Save size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
