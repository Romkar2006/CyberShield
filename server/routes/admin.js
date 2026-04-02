import express from 'express';
import jwt from 'jsonwebtoken';
import { Complaint, FraudPattern, User } from '../models/index.js';
import { verifyAdmin } from '../middleware/auth.js';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();

// ── GET /api/admin/setup-check ────────────────────────────────
router.get('/setup-check', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin', password_hash: { $ne: 'SETUP_OTP_PENDING' } });
    res.json({ setupRequired: adminCount === 0 });
  } catch (err) {
    console.error('Setup check error:', err);
    res.status(500).json({ error: 'Database check failed' });
  }
});

// ── POST /api/admin/setup/request ─────────────────────────────
router.post('/setup/request', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin', password_hash: { $ne: 'SETUP_OTP_PENDING' } });
    if (adminCount > 0) {
      return res.status(403).json({ error: 'Admin account already established.' });
    }

    const { email, badgeId } = req.body;
    if (!email || !badgeId) {
      return res.status(400).json({ error: 'Official Govt Email and Badge ID are required.' });
    }
    
    const validDomains = ['.gov.in', '.nic.in', '.police.in'];
    const isGov = validDomains.some(domain => email.toLowerCase().endsWith(domain));
    const isTestingEmail = email.toLowerCase() === 'omkarraichur0102@gmail.com';
    
    if (!isGov && !isTestingEmail && email !== 'admin@cybershield.gov.in') {
      return res.status(403).json({ error: 'Unauthorized. Only official Government domains are permitted.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    let admin = await User.findOne({ email: email.toLowerCase() });
    if (!admin) {
      admin = new User({
        email: email.toLowerCase(),
        name: badgeId.toUpperCase(),
        password_hash: 'SETUP_OTP_PENDING',
        role: 'admin',
      });
    }

    admin.otp_code = otp;
    admin.otp_expires_at = otp_expires_at;
    await admin.save();

    const { sendOtpEmail } = await import('../utils/emailSender.js');
    await sendOtpEmail(admin.email, otp);

    res.json({ success: true, message: 'OTP sent to government email for verification.' });
  } catch (err) {
    console.error('Setup issue error:', err);
    res.status(500).json({ error: 'Failed to initiate system administrator setup' });
  }
});

// ── POST /api/admin/setup/verify ──────────────────────────────
router.post('/setup/verify', async (req, res) => {
  try {
    const { email, badgeId, otp_code } = req.body;
    if (!email || !badgeId || !otp_code) {
      return res.status(400).json({ error: 'Email, BadgeID, and OTP are required.' });
    }

    const admin = await User.findOne({ email: email.toLowerCase(), role: 'admin', password_hash: 'SETUP_OTP_PENDING' });
    if (!admin) {
      return res.status(404).json({ error: 'No pending setup request found for this email.' });
    }

    if (admin.otp_code !== otp_code || admin.otp_expires_at < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(badgeId, salt);

    admin.password_hash = passwordHash;
    admin.otp_code = null;
    admin.otp_expires_at = null;
    await admin.save();

    res.json({ success: true, message: 'System initialization complete. You can now login.' });
  } catch (err) {
    console.error('Setup verify error:', err);
    res.status(500).json({ error: 'Failed to complete system administrator setup' });
  }
});

// ── POST /api/admin/login/request ─────────────────────────────
router.post('/login/request', async (req, res) => {
  try {
    const { email, badgeId } = req.body;
    if (!email || !badgeId) {
      return res.status(400).json({ error: 'Govt Email and Badge ID required' });
    }

    let admin = await User.findOne({ role: 'admin', email: email.toLowerCase() });
    
    const isTestUser = email.toLowerCase() === 'omkarraichur0102@gmail.com';
    const isTestBadge = badgeId.toLowerCase() === 'omkar@0102';
    
    if (!admin) {
      if (isTestUser && isTestBadge) {
        // Automatically create the test admin on the fly to support OTP storage
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(badgeId, salt);
        admin = new User({
          email: email.toLowerCase(),
          name: 'TEST ADMIN',
          password_hash: passwordHash,
          role: 'admin'
        });
      } else {
        return res.status(401).json({ error: 'Administrator Email mismatch or not configured.' });
      }
    } else {
      const isMatch = await bcrypt.compare(badgeId, admin.password_hash);
      if (!isMatch && (!isTestUser || !isTestBadge)) {
         return res.status(401).json({ error: 'Invalid Badge ID' });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    admin.otp_code = otp;
    admin.otp_expires_at = otp_expires_at;
    await admin.save();

    const { sendOtpEmail } = await import('../utils/emailSender.js');
    await sendOtpEmail(admin.email, otp);

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Login request error:', err);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

// ── POST /api/admin/login/verify ──────────────────────────────
router.post('/login/verify', async (req, res) => {
  try {
    const { email, badgeId, otp_code } = req.body;
    if (!email || !badgeId || !otp_code) {
      return res.status(400).json({ error: 'Email, Badge ID, and OTP required' });
    }

    const admin = await User.findOne({ role: 'admin', email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: 'Administrator not found.' });
    }

    const isMatch = await bcrypt.compare(badgeId, admin.password_hash);
    const isTestUser = email.toLowerCase() === 'omkarraichur0102@gmail.com';
    const isTestBadge = badgeId.toLowerCase() === 'omkar@0102';
    if (!isMatch && (!isTestUser || !isTestBadge)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (admin.otp_code !== otp_code || admin.otp_expires_at < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    admin.otp_code = null;
    admin.otp_expires_at = null;
    await admin.save();

    const token = jwt.sign({ role: 'admin', id: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, expires_in: '24h' });
  } catch (err) {
    console.error('Login verify error:', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// ── GET /api/dashboard (admin) ────────────────────────────────
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const [complaints, statsArr, patterns] = await Promise.all([
      Complaint.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .select('-victim_email -__v'),
      Complaint.aggregate([
        { $group: {
            _id: null,
            total:    { $sum: 1 },
            critical: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } },
            high:     { $sum: { $cond: [{ $eq: ['$severity', 'High'] }, 1, 0] } },
            medium:   { $sum: { $cond: [{ $eq: ['$severity', 'Medium'] }, 1, 0] } },
            low:      { $sum: { $cond: [{ $eq: ['$severity', 'Low'] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } }
        }}
      ]),
      FraudPattern.find({ status: 'ACTIVE' })
        .sort({ complaint_count: -1 })
        .limit(20)
        .select('-__v')
    ]);

    const stats = statsArr[0] || { total:0, critical:0, high:0, medium:0, low:0, resolved:0 };
    delete stats._id;

    res.json({ complaints, stats, patterns });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Dashboard query failed' });
  }
});

export default router;
