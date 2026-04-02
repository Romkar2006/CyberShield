import dns from 'dns';
// Force Google DNS — fixes Windows SRV lookup failures for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';
import axios from 'axios';

import complaintRoutes from './routes/complaints.js';
import analyticsRoutes from './routes/analytics.js';
import heatmapRoutes   from './routes/heatmap.js';
import alertRoutes     from './routes/alerts.js';
import articleRoutes   from './routes/articles.js';
import chatRoutes      from './routes/chat.js';
import adminRoutes     from './routes/admin.js';
import authRoutes      from './routes/auth.js';
import newsRoutes      from './routes/news.js';

import { checkEscalations } from './utils/escalation.js';

const app = express();

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://cybershield-india.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Expanded for high-fidelity citizen evidence and forensic base64 dossiers

// ── Rate limiters ─────────────────────────────────────────────
const classifyLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { error: 'Too many classification requests. Please wait 1 minute.' }
});

const chatLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  message: { error: 'Too many chat requests. Please wait 1 minute.' }
});

app.use('/api/complaints/classify', classifyLimiter);
app.use('/api/chat',                chatLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/heatmap',    heatmapRoutes);
app.use('/api/alerts',     alertRoutes);
app.use('/api/articles',   articleRoutes);
app.use('/api/chat',       chatRoutes);
app.use('/api/admin',      adminRoutes);


app.use('/api/auth',       authRoutes);
app.use('/api/news',       newsRoutes);

// ── Convenience alias: /api/dashboard -> admin dashboard ──────
app.get('/api/dashboard', (req, res) => {
  res.redirect('/api/admin/dashboard');
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── HuggingFace warm-up ───────────────────────────────────────
async function warmUpHuggingFace() {
  try {
    await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HF_MODEL_ID}`,
      { inputs: 'test', parameters: { max_new_tokens: 1 } },
      { headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` }, timeout: 90000 }
    );
    console.log('HuggingFace model warmed up');
  } catch {
    console.log('HF warm-up initiated (model loading, will be ready in ~60s)');
  }
}

// ── MongoDB → start server ────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`CyberShield server running on port ${PORT}`));

    // HuggingFace warm-up on start
    warmUpHuggingFace();

    // Keep model warm every 20 minutes (prevent cold starts during demo)
    cron.schedule('*/20 * * * *', warmUpHuggingFace);

    // Auto-escalation check every 5 minutes
    cron.schedule('*/5 * * * *', checkEscalations);
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
