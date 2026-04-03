import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { sendOtpEmail } from '../utils/emailSender.js';
import crypto from 'crypto';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// ── CITIZEN / COMMON OTP ROUTES ───────────────────────────────

router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to send OTP.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ email: email.toLowerCase() });
    
    // If user doesn't exist, create a shell user (role: 'user')
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        name: name || 'Citizen',
        password_hash: 'OTP_ACCOUNT',
        role: 'user',
        otp_code: otp,
        otp_expires_at
      });
    } else {
      user.otp_code = otp;
      user.otp_expires_at = otp_expires_at;
    }

    await user.save();
    
    // Send email
    await sendOtpEmail(user.email, otp);

    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ error: 'Server error while sending OTP.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp_code } = req.body;
    if (!email || !otp_code) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.otp_code !== otp_code) {
      return res.status(401).json({ error: 'Invalid OTP.' });
    }

    if (user.otp_expires_at < new Date()) {
      return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // OTP matched and valid -> clear it
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ error: 'Server error while verifying OTP.' });
  }
});

// ── CLASSIC REGISTER / LOGIN ──────────────────────────────────

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.password_hash !== 'OTP_ACCOUNT') {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    if (existingUser && existingUser.password_hash === 'OTP_ACCOUNT') {
      existingUser.name = name;
      existingUser.password_hash = password_hash;
      await existingUser.save();
      
      const token = jwt.sign(
        { id: existingUser._id, email: existingUser.email, role: existingUser.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      return res.status(200).json({ token, user: { id: existingUser._id, name: existingUser.name, email: existingUser.email, role: existingUser.role } });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password_hash,
      role: 'user'
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password_hash === 'OTP_ACCOUNT') {
      return res.status(401).json({ error: 'Invalid credentials or OTP account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── FORGOT / RESET PASSWORD ───────────────────────────────

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Allow any registered user to reset/set their password via this flow
    if (!user) {
       // We still send a success message to prevent user enumeration attacks
       return res.json({ success: true, message: 'If an account exists, a recovery code has been sent.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 Minute window
    await user.save();

    console.log(`[Identity-Recovery] Secure Code: ${otp} transmitted to ${user.email}`);

    await sendOtpEmail(user.email, otp);
    res.json({ success: true, message: 'Recovery OTP sent to your registered email.' });
  } catch (err) {
    console.error('[Identity-Recovery] Critical Error:', err.message);
    res.status(500).json({ error: 'Server error during recovery request.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp_code, newPassword } = req.body;

    if (!email || !otp_code || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and New Password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.otp_code !== otp_code) {
      return res.status(401).json({ error: 'Invalid or expired recovery code.' });
    }

    if (user.otp_expires_at < new Date()) {
      return res.status(401).json({ error: 'Recovery code has expired.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    
    // Clear recovery state
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Server error during password reset.' });
  }
});

// ── PROFILE MANAGEMENT ───────────────────────────────────────

router.get('/me', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash -otp_code -otp_expires_at');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/update-profile', verifyUser, async (req, res) => {
  try {
    const { 
      name, phone, language_pref, rank, badge_id, 
      department, specialization, years_of_service, profile_image,
      achievements, performance_stats 
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (language_pref) user.language_pref = language_pref;
    
    // Admin Fields
    if (rank) user.rank = rank;
    if (badge_id) user.badge_id = badge_id;
    if (department) user.department = department;
    if (specialization) user.specialization = specialization;
    if (years_of_service !== undefined) user.years_of_service = years_of_service;
    if (profile_image) user.profile_image = profile_image;

    // New Data Fields
    if (achievements) user.achievements = achievements;
    if (performance_stats) user.performance_stats = performance_stats;
    
    await user.save();
    res.json({ 
      success: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        rank: user.rank,
        badge_id: user.badge_id,
        department: user.department,
        specialization: user.specialization,
        years_of_service: user.years_of_service,
        profile_image: user.profile_image,
        achievements: user.achievements,
        performance_stats: user.performance_stats
      } 
    });

  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: 'Server error while updating profile.' });
  }
});

export default router;
