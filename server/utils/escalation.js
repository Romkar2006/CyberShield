import nodemailer from 'nodemailer';
import { Complaint } from '../models/index.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
});

export async function checkEscalations() {
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const cases = await Complaint.find({
      severity:         { $in: ['Critical', 'High'] },
      status:           'RECEIVED',
      escalation_sent:  false,
      createdAt:        { $lt: thirtyMinAgo }
    });

    for (const complaint of cases) {
      try {
        const html = `
          <div style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:8px;">
            <h2 style="color:#dc2626">ESCALATION ALERT — ${complaint.severity} Priority Case Not Assigned</h2>
            <p><strong>Reference:</strong> ${complaint.ref_no}</p>
            <p><strong>Categories:</strong> ${complaint.categories.join(', ')}</p>
            <p><strong>Severity:</strong> ${complaint.severity}</p>
            <p><strong>Filed at:</strong> ${complaint.createdAt.toLocaleString('en-IN')}</p>
            <p><strong>Status:</strong> ${complaint.status} (unassigned for 30+ minutes)</p>
            <p style="color:#fca5a5">Please log in to CyberShield admin dashboard and assign this case immediately.</p>
          </div>
        `;
        await transporter.sendMail({
          from:    `CyberShield Alerts <${process.env.GMAIL_USER}>`,
          to:      process.env.ADMIN_EMAIL,
          subject: `[ESCALATION] ${complaint.severity} case ${complaint.ref_no} unassigned 30+ min`,
          html
        });
        await Complaint.findByIdAndUpdate(complaint._id, { escalation_sent: true });
        console.log(`Escalation sent for ${complaint.ref_no}`);
      } catch (err) {
        console.error(`Escalation failed for ${complaint.ref_no}:`, err.message);
      }
    }
  } catch (err) {
    console.error('checkEscalations error:', err.message);
  }
}
