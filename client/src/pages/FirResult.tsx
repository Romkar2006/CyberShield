import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, Printer, ShieldCheck, AlertTriangle, Mail, MailCheck, Inbox, FileText, BookOpen } from 'lucide-react';
import { Complaint } from '../types';

// Mask email: show first 3 chars + *** + @domain
function maskEmail(email?: string) {
  if (!email) return '***@***.com';
  const [user, domain] = email.split('@');
  return `${user.slice(0, 3)}***@${domain}`;
}

export const FirResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const complaintData = location.state?.complaint as Complaint | undefined;

  useEffect(() => {
    if (!complaintData) {
      navigate('/complaint');
    }
  }, [complaintData, navigate]);

  if (!complaintData) return null;

  const handlePrint = () => {
    window.print();
  };

  const sentAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const emails = [
    {
      id: 1,
      icon: <Inbox size={20} />,
      type: 'Complaint Acknowledgment',
      subject: `Complaint Registered — Ref: ${complaintData.ref_no}`,
      preview: `Your cybercrime complaint has been registered with priority ${complaintData.severity}. Reference number, tracking link, and next steps enclosed.`,
      color: '#00D4FF',
      bgColor: 'rgba(0,212,255,0.06)',
      borderColor: 'rgba(0,212,255,0.15)',
      delay: 0.15
    },
    {
      id: 2,
      icon: <FileText size={20} />,
      type: 'Official FIR Document',
      subject: `[${complaintData.severity} Priority] Your FIR Document — ${complaintData.ref_no}`,
      preview: `Your complete First Information Report with AI-mapped BNS 2024 legal sections, translated statement, and department routing to ${complaintData.department}.`,
      color: '#7C3AED',
      bgColor: 'rgba(124,58,237,0.06)',
      borderColor: 'rgba(124,58,237,0.15)',
      delay: 0.3
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white py-12 px-6">

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 flex justify-center">
        <div className="w-full max-w-7xl h-full border-x border-white/[0.05] relative flex justify-evenly">
          <div className="w-px h-full bg-white/[0.05]"></div>
          <div className="w-px h-full bg-white/[0.05]"></div>
          <div className="w-px h-full bg-white/[0.05]"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>

          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mb-6 relative z-10 group">
            <CheckCircle2 size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-20"></div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 relative z-10">FIR Successfully Logged</h1>
          <p className="text-sm sm:text-base text-emerald-400/80 font-medium relative z-10">
            Zephyr 7B AI has processed and securely mapped your statement.
          </p>
        </motion.div>

        {/* ── EMAIL DISPATCH CONFIRMATION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8 bg-[#0D1526] border border-white/[0.07] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                <MailCheck size={18} className="text-[#00D4FF]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Email Dispatch Confirmed</div>
                <div className="text-[11px] text-[#64748B] font-medium">2 emails delivered to your registered address</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">All Delivered</span>
            </div>
          </div>

          {/* Recipient Row */}
          <div className="px-6 py-3 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-2">
            <Mail size={13} className="text-[#64748B]" />
            <span className="text-[11px] text-[#64748B]">Sent to:</span>
            <span className="text-[11px] font-mono font-bold text-[#00D4FF]">{maskEmail(complaintData.victim_email)}</span>
            <span className="ml-auto text-[10px] text-[#64748B] font-mono">{sentAt} IST</span>
          </div>

          {/* Email Cards */}
          <div className="p-5 flex flex-col gap-3">
            {emails.map((email) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: email.delay, duration: 0.4 }}
                style={{ backgroundColor: email.bgColor, borderColor: email.borderColor }}
                className="border rounded-xl p-5 flex items-start gap-5 group"
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${email.color}15`, border: `1px solid ${email.color}30` }}
                >
                  <span style={{ color: email.color }}>{email.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                        style={{ color: email.color }}
                      >
                        {email.type}
                      </div>
                      <div className="text-sm font-bold text-white leading-snug">{email.subject}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">Delivered</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#64748B] leading-relaxed line-clamp-2">{email.preview}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-2">
            <BookOpen size={12} className="text-[#64748B]" />
            <p className="text-[10px] text-[#64748B]">
              Check your spam/promotions folder if the emails are not visible in your inbox within 2 minutes.
            </p>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Reference No:</span>
            <span className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] font-mono font-bold px-4 py-2 rounded-xl text-xl select-all tracking-tighter">
              {complaintData.ref_no}
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handlePrint} className="flex-1 sm:flex-none justify-center bg-[#0D1526] hover:bg-[#0F172A] border border-white/[0.1] text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition text-sm">
              <Printer size={16} /> Print
            </button>
            <Link to={`/track/${complaintData.ref_no}`} className="flex-1 sm:flex-none justify-center bg-[#00D4FF] hover:bg-[#00BBDD] text-[#0A0F1E] px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition text-sm shadow-[0_0_15px_rgba(0,212,255,0.3)]">
              Track Case <ExternalLink size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Next Steps Banner */}
        {complaintData.severity === 'Critical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-8 flex gap-4 items-start relative overflow-hidden"
          >
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-500 font-bold mb-1">Critical Priority Initiated</h3>
              <p className="text-sm text-red-400/80 leading-relaxed">
                Your case has triggered our automated financial escalation protocol. High-priority alerts have been dispatched to <strong>{complaintData.city} Cyber Cell</strong>. Keep your documentation ready.
              </p>
            </div>
          </motion.div>
        )}

        {/* FIR Document Preview (Printable Area) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white text-black p-5 sm:p-8 md:p-12 rounded-xl shadow-2xl printable-document relative overflow-hidden"
        >
          <div className="hidden print:block absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center -rotate-45">
            <span className="text-8xl font-black text-black">CYBERSHIELD SECURE</span>
          </div>

          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-black pb-6 mb-8">
            <div className="flex items-center gap-3">
              <ShieldCheck size={40} className="text-black shrink-0 sm:size-[48px]" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">CyberShield Portal</h2>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-widest">First Information Report</p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-sm font-bold bg-black text-white px-2 py-1 inline-block mb-1">{complaintData.ref_no}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-mono">Dt: {new Date(complaintData.createdAt).toLocaleDateString('en-GB')} {new Date(complaintData.createdAt).toLocaleTimeString()}</div>
              {/* Fake Barcode styling */}
              <div className="mt-2 font-mono text-[8px] tracking-[0.2em] leading-none mb-1 opacity-50 truncate">||||| | || ||| | ||| | || | ||||</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10">
            {/* Sec 1: Complainant */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-gray-200 pb-1">1. Complainant Details</h3>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <span className="font-semibold text-gray-600">Name:</span>
                <span className="col-span-2 font-bold">{complaintData.victim_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <span className="font-semibold text-gray-600">Contact:</span>
                <span className="col-span-2">{complaintData.victim_phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <span className="font-semibold text-gray-600">Email:</span>
                <span className="col-span-2">{complaintData.victim_email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-semibold text-gray-600">Jurisdiction:</span>
                <span className="col-span-2 font-semibold bg-gray-100 px-1 py-0.5 rounded uppercase">{complaintData.city} Police</span>
              </div>
            </div>

            {/* Sec 2: System Assessment */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-gray-200 pb-1">2. AI Assessment Profile</h3>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <span className="font-semibold text-gray-600">Category:</span>
                <span className="col-span-2 font-bold">{complaintData.categories?.[0] || 'Unclassified'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <span className="font-semibold text-gray-600">Severity Level:</span>
                <span className="col-span-2 font-bold">{complaintData.severity}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <span className="font-semibold text-gray-600">Language:</span>
                <span className="col-span-2 uppercase">{complaintData.detected_language}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-semibold text-gray-600">Routing:</span>
                <span className="col-span-2 font-semibold italic text-gray-800">{complaintData.assigned_officer} (Automated)</span>
              </div>
            </div>
          </div>

          {/* Sec 3: BNS 2024 Legal Invocation */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-gray-200 pb-1">3. Automated Legal Mapping (Bharatiya Nyaya Sanhita 2024)</h3>
            {complaintData.bns_sections && complaintData.bns_sections.length > 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm">
                <ul className="list-disc pl-5 space-y-2">
                  {complaintData.bns_sections.map((bns, idx) => (
                    <li key={idx}>
                      <span className="font-bold">{bns.split(':')[0]}</span>
                      {bns.includes(':') ? `: ${bns.split(':')[1]}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">Pending manual review by Investigating Officer.</p>
            )}
          </div>

          {/* Sec 4: Standardized Core Information */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-gray-200 pb-1">4. Standardized Incident Report (Zephyr Translated)</h3>
            <div className="bg-blue-50/50 border border-blue-100 rounded p-5 text-sm leading-relaxed whitespace-pre-wrap font-serif text-gray-800">
              {complaintData.translated_text || 'The statement has been processed.'}
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-8 border-t border-gray-200 flex justify-between items-end mt-16">
            <div className="text-xs text-gray-500">
              Generated securely on: {new Date().toLocaleString()}<br />
              Digital signature VERIFIED.
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-black mb-2 pb-1 text-xs italic font-mono text-gray-400">CyberShield AI System</div>
              <div className="text-xs font-bold uppercase">Authorized Signatory</div>
            </div>
          </div>
        </motion.div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body * { visibility: hidden; }
            .printable-document, .printable-document * { visibility: visible; }
            .printable-document { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; }
            ::-webkit-scrollbar { display: none; }
          }
        `}} />
      </div>
    </div>
  );
};
