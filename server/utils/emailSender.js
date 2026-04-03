import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Validate credentials before creating transporter
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.warn('[EmailSender] GMAIL_USER or GMAIL_PASS not found in .env. Emails will fail to send.');
}

// ── Transporter — Dedicated CyberShield Portal Mailer ────────
// ── Transporter — Dedicated CyberShield Portal Mailer ────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS for Cloud-IP compatibility
  pool: true,
  connectionTimeout: 10000, // 10 seconds timeout for cloud latency
  greetingTimeout: 10000,
  tls: {
    rejectUnauthorized: false // Bypasses Render/Cloud IP handshake blocks
  },
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('[EmailSender] SMTP Connection Error:', error);
  } else {
    console.log('[EmailSender] SMTP Server is ready to take messages');
  }
});

// Sender displays as official portal address
// SMTP Auth (GMAIL_USER) must match or authorize the 'From' address.
const SENDER_ADDRESS = process.env.GMAIL_USER;
const SENDER_DISPLAY = `CyberShield | Ministry of Home Affairs <${SENDER_ADDRESS}>`;

console.log(`[EmailSender] Initialized with sender: ${SENDER_ADDRESS}`);

// ── Severity colour helpers ───────────────────────────────────
function severityColor(severity) {
  const map = {
    Critical: { bg: '#FEF2F2', text: '#991B1B', border: '#F87171' },
    High: { bg: '#FFFBEB', text: '#92400E', border: '#FBBF24' },
    Medium: { bg: '#EFF6FF', text: '#1E40AF', border: '#60A5FA' },
    Low: { bg: '#F0FDF4', text: '#166534', border: '#4ADE80' }
  };
  return map[severity] || map.Medium;
}

// ── Shared GOI-style header HTML ─────────────────────────────
function govtHeader(title, subtitle) {
  return `
  <!-- MINIMAL INSTITUTIONAL HEADER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-bottom:1px solid #E2E8F0;">
    <tr>
      <td style="padding:40px 40px 30px; text-align:left;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:50px;">
               <div style="width:40px; height:40px; background:#0F172A; border-radius:8px; text-align:center; line-height:40px; color:#00D4FF; font-weight:900; font-size:20px; font-family:Arial, sans-serif;">CS</div>
            </td>
            <td style="padding-left:15px;">
              <div style="font-size:16px; font-weight:800; color:#0F172A; font-family:Arial, sans-serif; letter-spacing:-0.5px; text-transform:uppercase;">Cyber<span style="color:#00D4FF;">Shield</span> India</div>
              <div style="font-size:10px; color:#64748B; font-family:Arial, sans-serif; font-weight:700; letter-spacing:1px; text-transform:uppercase;">National Cyber Intelligence Portal</div>
            </td>
            <td style="text-align:right; vertical-align:top;">
               <div style="font-size:9px; color:#94A3B8; font-family:Arial, sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Official Cyber Registry</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 20px;">
        <div style="font-size:20px; font-weight:800; color:#1E293B; font-family:Arial, sans-serif; letter-spacing:-0.5px;">${title}</div>
        ${subtitle ? `<div style="font-size:12px; color:#64748B; margin-top:4px; font-family:Arial, sans-serif;">${subtitle}</div>` : ''}
      </td>
    </tr>
  </table>`;
}

// ── Shared GOI-style footer HTML ─────────────────────────────
function govtFooter(ref_no) {
  return `
  <!-- MINIMAL FOOTER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC; border-top:1px solid #E2E8F0;">
    <tr>
      <td style="padding:40px;">
        <div style="font-size:11px; color:#64748B; font-family:Arial,sans-serif; line-height:1.8; text-align:left;">
          <strong style="color:#475569;">OFFICIAL EMERGENCY HELPLINES (24x7):</strong><br>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
            <tr>
              <td style="font-size:13px; font-weight:800; color:#00D4FF; width:25%;">1930 <span style="font-size:10px; color:#94A3B8; font-weight:400;">(Cyber Crime)</span></td>
              <td style="font-size:13px; font-weight:800; color:#EF4444; width:25%;">112 <span style="font-size:10px; color:#94A3B8; font-weight:400;">(Emergency)</span></td>
              <td style="font-size:13px; font-weight:800; color:#1E293B; width:25%;">181 <span style="font-size:10px; color:#94A3B8; font-weight:400;">(Women)</span></td>
              <td style="font-size:13px; font-weight:800; color:#1E293B; width:25%;">1091 <span style="font-size:10px; color:#94A3B8; font-weight:400;">(Safety)</span></td>
            </tr>
          </table>
          <br>
          <strong style="color:#475569;">SECURITY NOTICE:</strong> This is an officially generated communication from the CyberShield National Portal. All data is encrypted and handled per IT Act 2000 protocols. If you did not initiate this request, please report it to our security cell immediately.<br><br>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:10px; color:#94A3B8; text-transform:uppercase; letter-spacing:1px;">Ref: ${ref_no || 'N/A'}</td>
              <td style="text-align:right;">
                <span style="font-size:10px; font-weight:700; color:#00D4FF;">Official Communication</span>
              </td>
            </tr>
          </table>
          <div style="margin-top:20px; padding-top:20px; border-top:1px solid #E2E8F0; text-align:center; color:#94A3B8; font-size:10px;">
            CyberShield India &bull; National Cyber Crime Bureau &bull; New Delhi, India<br>
          </div>
        </div>
      </td>
    </tr>
  </table>`;
}

// ── Welcome / Acknowledgment Email ───────────────────────────
export async function sendWelcomeEmail(to, data) {
  const { ref_no, categories, severity, name } = data;
  const sev = severityColor(severity);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Acknowledgment — ${ref_no}</title>
</head>
<body style="margin:0; padding:0; background:#F1F5F9; font-family: 'Inter', -apple-system, Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9; padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 25px rgba(0,0,0,0.05); border:1px solid #E2E8F0;">

  <!-- MINIMAL HEADER -->
  <tr><td>
    ${govtHeader('E-FIR Acknowledgment', 'Case successfully initiated in National Registry')}
  </td></tr>

  <!-- BODY CONTENT -->
  <tr>
    <td style="padding:40px;">
      <div style="font-size:14px; color:#64748B; margin-bottom:8px;">Hello,</div>
      <div style="font-size:18px; font-weight:800; color:#0F172A; margin-bottom:24px;">${name}</div>

      <!-- ACKNOWLEDGMENT PARAGRAPH -->
      <div style="padding:20px; background:#F0FDFA; border:1px solid #5EEAD4; border-left:4px solid #0D9488; border-radius:12px; margin-bottom:30px;">
        <div style="font-size:13px; font-weight:800; color:#0D9488; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Official Acknowledgment</div>
        <p style="font-size:14px; color:#134E4A; line-height:1.6; margin:0;">
          We have successfully received your cybercrime complaint at the National Registry. This email serves as an official certification that your report is now in our system and has been assigned for immediate triage. We appreciate your vigilance in reporting this incident.
        </p>
      </div>

      <p style="font-size:15px; color:#475569; line-height:1.6; margin-bottom:30px;">
        Your submission is being processed by the <strong style="color:#0F172A;">National Cyber Intelligence Cell</strong>. Below are the critical details and tracking IDs for your case.
      </p>

      <div style="background:#0F172A; border-radius:12px; padding:30px; margin-bottom:30px; text-align:center; box-shadow:0 10px 30px rgba(15,23,42,0.2);">
        <div style="font-size:11px; font-weight:800; color:#00D4FF; text-transform:uppercase; letter-spacing:3px; margin-bottom:10px;">Acknowledgment Reference Number</div>
        <div style="font-size:32px; font-weight:900; color:#FFFFFF; font-family:monospace; margin-bottom:20px; letter-spacing:4px;">${ref_no}</div>
        <div style="display:inline-block; background:${sev.bg}; color:${sev.text}; border:1px solid ${sev.border}; padding:8px 24px; border-radius:50px; font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">${severity} SEVERITY LEVEL</div>
      </div>

      <!-- IMMEDIATE SAFETY PRECAUTIONS -->
      <div style="margin-bottom:30px; padding:24px; border:1.5px solid #EF4444; border-radius:16px; background:#FEF2F2;">
        <div style="font-size:14px; font-weight:900; color:#991B1B; text-transform:uppercase; letter-spacing:2px; margin-bottom:16px;">&#9888; IMMEDIATE SAFETY CHECKLIST</div>
        <ul style="padding:0; margin:0; list-style:none;">
          <li style="margin-bottom:12px; font-size:13px; color:#7F1D1D; line-height:1.6;">&bull; **Contact your Bank:** Immediately call 1930 if financial loss occurred.</li>
          <li style="margin-bottom:12px; font-size:13px; color:#7F1D1D; line-height:1.6;">&bull; **Freeze Exposure:** Block compromised accounts, cards, and change all passwords.</li>
          <li style="margin-bottom:12px; font-size:13px; color:#7F1D1D; line-height:1.6;">&bull; **Zero Interaction:** Do not engage further with the suspicious entities.</li>
          <li style="margin-bottom:0; font-size:13px; color:#7F1D1D; line-height:1.6;">&bull; **Digital Audit:** Log out of all devices and check for unauthorized logins.</li>
        </ul>
      </div>

      <div style="font-size:14px; font-weight:800; color:#0F172A; text-transform:uppercase; letter-spacing:1px; margin-bottom:20px;">Immediate Instructions</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
        ${[
          ['Reference ID', `Use <strong>${ref_no}</strong> for all inquiries.`],
          ['Evidence', 'Retain all screenshots, logs, and transaction receipts.'],
          ['Tracking', `Track status at <a href="${process.env.CLIENT_URL}/track/${ref_no}" style="color:#00D4FF; text-decoration:none; font-weight:700;">Online Portal</a>.`],
        ].map(([t, d], i) => `
        <tr>
          <td style="padding-bottom:15px; vertical-align:top; width:25px;">
             <div style="width:18px; height:18px; background:#0F172A; color:#FFFFFF; font-size:10px; line-height:18px; text-align:center; border-radius:4px; font-weight:800;">${i+1}</div>
          </td>
          <td style="padding-bottom:15px; padding-left:10px;">
             <div style="font-size:13px; font-weight:700; color:#1E293B; margin-bottom:2px;">${t}</div>
             <div style="font-size:13px; color:#64748B; line-height:1.5;">${d}</div>
          </td>
        </tr>`).join('')}
      </table>

      <div style="text-align:center; margin-top:20px;">
         <a href="${process.env.CLIENT_URL}/track/${ref_no}" style="display:inline-block; background:#0F172A; color:#FFFFFF; padding:16px 32px; border-radius:12px; font-weight:800; font-size:14px; text-decoration:none; text-transform:uppercase; letter-spacing:0.5px;">Track Case Progress</a>
      </div>

      <div style="margin-top:40px; pt-30px; border-top:1px solid #E2E8F0; padding-top:30px;">
         <div style="font-size:13px; color:#94A3B8;">Regards,</div>
         <div style="font-size:14px; font-weight:700; color:#0F172A; margin-top:5px;">CyberShield System Core</div>
         <div style="font-size:12px; color:#64748B;">National Cyber Intelligence Cell</div>
      </div>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr><td>${govtFooter(ref_no)}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await transporter.sendMail({
    from: SENDER_DISPLAY,
    replyTo: SENDER_ADDRESS,
    to,
    subject: `[Complaint Registered] E-FIR Acknowledgment — Ref: ${ref_no} | CyberShield India`,
    html
  });
}

// ── Official FIR Document Email ───────────────────────────────
export async function sendFirEmail(to, data) {
  const { ref_no, categories, severity, department, bns_sections, original_text, translated_text, name, city } = data;
  const sev = severityColor(severity);

  const bnsRows = (bns_sections || []).map((s, i) => `
    <tr style="background:${i % 2 === 0 ? '#0F172A' : '#0D1526'};">
      <td style="padding:8px 16px; font-size:11px; color:#64748B; font-family:'Courier New',monospace; width:20px; border-bottom:1px solid rgba(255,255,255,0.04);">${String(i + 1).padStart(2, '0')}</td>
      <td style="padding:8px 16px; font-size:12px; color:#A78BFA; font-family:'Courier New',monospace; border-bottom:1px solid rgba(255,255,255,0.04);">${s.split(':')[0].trim()}</td>
      <td style="padding:8px 16px; font-size:12px; color:#94A3B8; border-bottom:1px solid rgba(255,255,255,0.04);">${s.includes(':') ? s.split(':')[1].trim() : ''}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Official E-FIR — ${ref_no}</title>
</head>
<body style="margin:0; padding:0; background:#F1F5F9; font-family: 'Inter', Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9; padding:40px 20px;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 10px 40px rgba(0,0,0,0.1); border:1px solid #E2E8F0;">

  <!-- MINIMAL HEADER -->
  <tr><td>
    ${govtHeader('Official E-FIR Report', 'National Cyber Crime Bureau — Intelligence Document')}
  </td></tr>

  <!-- STATUS BANNER -->
  <tr>
    <td style="background:#F8FAFC; padding:15px 40px; border-bottom:1px solid #E2E8F0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="font-size:10px; font-weight:800; color:#64748B; letter-spacing:1px; text-transform:uppercase;">
              STATUS: ${severity.toUpperCase()} PRIORITY &nbsp;|&nbsp; IDENTITY VERIFIED
            </span>
          </td>
          <td style="text-align:right;">
            <span style="font-size:10px; font-weight:800; color:#00D4FF; letter-spacing:1.5px; font-family:monospace;">${ref_no}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- BODY CONTENT -->
  <tr>
    <td style="padding:40px;">

      <!-- ACKNOWLEDGMENT PARAGRAPH -->
      <div style="padding:20px; background:#F8FAFC; border:1px solid #E2E8F0; border-left:4px solid #0F172A; border-radius:12px; margin-bottom:30px;">
        <div style="font-size:12px; font-weight:800; color:#0F172A; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Official Acknowledgment of Complaint</div>
        <p style="font-size:14px; color:#475569; line-height:1.6; margin:0;">
          This document serves as an institutional acknowledgment that your cybercrime report has been formally registered in the CyberShield National Database. Our system has completed its initial analysis, and your case (Ref: ${ref_no}) has been assigned for official review.
        </p>
      </div>

      <!-- HIGH-IMPACT HIGHLIGHTS -->
      <div style="background:#0F172A; border-radius:16px; padding:35px; margin-bottom:35px; text-align:center;">
        <div style="font-size:11px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">CASE REFERENCE ID</div>
        <div style="font-size:36px; font-weight:900; color:#FFFFFF; font-family:monospace; letter-spacing:5px; margin-bottom:15px;">${ref_no}</div>
        <div style="display:inline-block; background:${sev.bg}; color:${sev.text}; border:1px solid ${sev.border}; padding:6px 20px; border-radius:6px; font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:1.5px;">IDENTIFIED SEVERITY: ${severity}</div>
      </div>

      <!-- IMMEDIATE SAFETY STEPS -->
      <div style="background:#FFFBEB; border:1px solid #F6E05E; border-radius:12px; padding:24px; margin-bottom:35px;">
        <div style="font-size:13px; font-weight:800; color:#92400E; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">&#9888; CRITICAL SAFETY PRECAUTIONS</div>
        <div style="font-size:13px; color:#92400E; margin-bottom:8px;">&bull; **Password Reset:** Change all passwords for social, bank, and email accounts.</div>
        <div style="font-size:13px; color:#92400E; margin-bottom:8px;">&bull; **2FA Activation:** Enable Two-Factor Authentication on all supported platforms.</div>
        <div style="font-size:13px; color:#92400E; margin-bottom:8px;">&bull; **Documentation:** Do not alter or delete the original source of the incident.</div>
        <div style="font-size:13px; color:#92400E;">&bull; **Isolation:** Disconnect compromised devices from local networks immediately.</div>
      </div>
      
      <!-- COMPLAINANT SECTION -->
      <div style="font-size:12px; font-weight:800; color:#0F172A; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:20px; border-bottom:2px solid #00D4FF; display:inline-block; padding-bottom:4px;">I. Incident Metadata</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px; background:#F8FAFC; border-radius:12px; border:1px solid #E2E8F0;">
        ${[
          ['Complainant', name],
          ['Jurisdiction', `${city || 'National'} Cyber Cell`],
          ['FIR Reference', ref_no],
          ['Classification', categories.join(' | ')],
        ].map(([k, v]) => `
        <tr>
          <td style="padding:15px; font-size:11px; color:#94A3B8; text-transform:uppercase; font-weight:700; width:140px; border-bottom:1px solid #E2E8F0;">${k}</td>
          <td style="padding:15px; font-size:13px; color:#1E293B; font-weight:700; border-bottom:1px solid #E2E8F0;">${v}</td>
        </tr>`).join('')}
      </table>

      <!-- AI LEGAL MATRIX -->
      <div style="font-size:12px; font-weight:800; color:#0F172A; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:20px; border-bottom:2px solid #7C3AED; display:inline-block; padding-bottom:4px;">II. AI Legal Mapping (BNS 2024)</div>
      <div style="margin-bottom:30px; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr style="background:#0F172A;">
             <td style="padding:12px 15px; font-size:10px; color:#FFFFFF; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Statute / Clause</td>
             <td style="padding:12px 15px; font-size:10px; color:#FFFFFF; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Legal Description</td>
          </tr>
          ${(bns_sections || []).map(s => `
          <tr>
            <td style="padding:15px; font-size:12px; color:#7C3AED; font-weight:800; border-bottom:1px solid #E2E8F0; width:120px;">${s.split(':')[0].trim()}</td>
            <td style="padding:15px; font-size:12px; color:#475569; border-bottom:1px solid #E2E8F0;">${s.includes(':') ? s.split(':')[1].trim() : ''}</td>
          </tr>`).join('')}
        </table>
      </div>

      <!-- STATEMENT -->
      <div style="font-size:12px; font-weight:800; color:#0F172A; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:20px; border-bottom:2px solid #64748B; display:inline-block; padding-bottom:4px;">III. Statement of Facts</div>
      <div style="padding:24px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; font-size:14px; color:#475569; line-height:1.7; font-style:italic; margin-bottom:30px;">
        "${translated_text || original_text}"
      </div>

      <!-- OFFICIAL AUTHENTICATION -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px; padding-top:30px; border-top:2px solid #F1F5F9;">
        <tr>
          <td>
            <div style="font-size:11px; color:#94A3B8; text-transform:uppercase; font-weight:700;">Authorized Registrar</div>
            <div style="font-size:15px; font-weight:800; color:#0F172A; margin-top:4px;">Zephyr 7B Neural Core</div>
            <div style="font-size:11px; color:#64748B;">National Forensic Intelligence Platform</div>
          </td>
          <td style="text-align:right;">
             <div style="font-size:10px; color:#94A3B8; font-family:monospace;">D-SIGNED: ${new Date().toLocaleDateString('en-GB')}<br>CERTIFICATE: CC-990-2024</div>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr><td>${govtFooter(ref_no)}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await transporter.sendMail({
    from: SENDER_DISPLAY,
    replyTo: SENDER_ADDRESS,
    to,
    subject: `[OFFICIAL E-FIR] ${severity} Priority — FIR No. ${ref_no} | CyberShield National Cyber Cell`,
    html
  });
}

// ── OTP email ─────────────────────────────────────────────────
export async function sendOtpEmail(to, otp) {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Verification Code</title></head>
<body style="margin:0; padding:0; background:#F1F5F9; font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9; padding:40px 20px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05); border:1px solid #E2E8F0;">
  <tr>
    <td style="padding:40px; text-align:center;">
      <div style="width:40px; height:40px; background:#0F172A; border-radius:8px; text-align:center; line-height:40px; color:#00D4FF; font-weight:900; font-size:20px; margin:0 auto 20px;">CS</div>
      <div style="font-size:12px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Identity Verification</div>
      <div style="font-size:20px; font-weight:800; color:#1E293B; margin-bottom:24px;">Confirm your access</div>
      
      <div style="font-size:14px; color:#475569; margin-bottom:30px; line-height:1.6;">Your one-time passcode for secure access to the CyberShield portal is:</div>
      
      <div style="font-size:36px; font-weight:800; color:#0F172A; letter-spacing:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:24px; margin-bottom:30px; font-family:monospace;">${otp}</div>
      
      <div style="font-size:11px; color:#94A3B8; font-weight:700; text-transform:uppercase; letter-spacing:1px;">This code expires in 10 minutes.</div>
    </td>
  </tr>
  <tr>
    <td style="background:#F8FAFC; padding:20px; text-align:center; border-top:1px solid #E2E8F0;">
      <div style="font-size:10px; color:#94A3B8;">&copy; ${new Date().getFullYear()} CyberShield India &bull; Ministry of Home Affairs</div>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  await transporter.sendMail({
    from: SENDER_DISPLAY,
    replyTo: SENDER_ADDRESS,
    to,
    subject: `[CyberShield Security] Your OTP: ${otp} — Do Not Share`,
    html
  });
}

// ── Officer Assignment Email ───────────────────────────────
export async function sendOfficerAssignmentEmail(officerEmail, data) {
  const { ref_no, severity, name, department, categories } = data;
  const sev = severityColor(severity);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Case Assignment</title></head>
<body style="margin:0; padding:0; background:#F1F5F9; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9; padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05); border:1px solid #E2E8F0;">
        <tr>
          <td style="padding:40px; background:#0F172A;">
            <div style="font-size:11px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">CyberShield Official Assignment</div>
            <div style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:5px;">New Case Assigned</div>
            <div style="font-size:12px; color:#00D4FF; font-family:monospace; font-weight:800;">REF ID: ${ref_no}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <div style="font-size:15px; color:#475569; line-height:1.7; margin-bottom:30px;">
              Officer, you have been designated as the **Lead Investigating Officer** for the following cybercrime report. Immediate review and triage are required.
            </div>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px; border:1px solid #E2E8F0; border-radius:12px; background:#F8FAFC; overflow:hidden;">
              ${[
                ['Priority', severity.toUpperCase(), sev.text],
                ['Complainant', name, '#0F172A'],
                ['Crime Type', categories.join(' | '), '#0F172A'],
                ['Department', department, '#0F172A'],
              ].map(([k, v, c]) => `
              <tr>
                <td style="padding:15px; font-size:11px; color:#94A3B8; text-transform:uppercase; font-weight:800; border-bottom:1px solid #E2E8F0; width:120px;">${k}</td>
                <td style="padding:15px; font-size:13px; color:${c}; font-weight:800; border-bottom:1px solid #E2E8F0;">${v}</td>
              </tr>`).join('')}
            </table>

            <div style="text-align:center;">
              <a href="${process.env.CLIENT_URL}/admin" style="display:inline-block; background:#0F172A; color:#FFFFFF; padding:16px 32px; border-radius:12px; font-weight:800; font-size:14px; text-decoration:none; text-transform:uppercase; letter-spacing:1px;">Access Investigation Dashboard</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:30px; background:#F8FAFC; border-top:1px solid #E2E8F0; text-align:center;">
            <div style="font-size:10px; color:#94A3B8; font-weight:700;">CLASSIFIED COMMUNICATION &bull; MINISTRY OF HOME AFFAIRS</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: SENDER_DISPLAY,
    to: officerEmail,
    subject: `[NEW CASE] ${severity} Priority assigned: ${ref_no} | CyberShield India`,
    html
  });
}

