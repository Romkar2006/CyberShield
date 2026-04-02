# CyberShield — Backend Build Instructions
# Read gemini.md FIRST. Then read this file completely before writing any backend code.
# This file tells you exactly how to build every part of the Express backend.

## Critical rules for backend code
1. All files use ESModules: import/export (never require/module.exports)
2. package.json must have "type": "module"
3. All async operations use async/await (never callbacks)
4. Every route must have try/catch — never let unhandled errors crash the server
5. Never expose sensitive data: no victim_email in public routes, no passwords anywhere
6. Rate limit /api/complaints/classify and /api/chat (prevent abuse)
7. Sanitize all user text input before passing to ML pipeline
8. All environment variables loaded from .env via dotenv

## server.js — Entry point
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';

import complaintRoutes from './routes/complaints.js';
import analyticsRoutes from './routes/analytics.js';
import heatmapRoutes from './routes/heatmap.js';
import alertRoutes from './routes/alerts.js';
import articleRoutes from './routes/articles.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import { checkEscalations } from './utils/escalation.js';

dotenv.config();

const app = express();

// CORS — allow frontend origin only
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'https://your-app.vercel.app'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting on expensive routes
const classifyLimiter = rateLimit({ windowMs: 60000, max: 10, message: { error: 'Too many requests' } });
const chatLimiter = rateLimit({ windowMs: 60000, max: 30, message: { error: 'Too many chat requests' } });

app.use('/api/complaints/classify', classifyLimiter);
app.use('/api/chat', chatLimiter);

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check for Render uptime monitoring
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Escalation cron — every 5 minutes
cron.schedule('*/5 * * * *', checkEscalations);

// MongoDB connect then start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => {
    console.error('MongoDB failed:', err.message);
    process.exit(1);
  });
```

## package.json dependencies
```json
{
  "name": "cybershield-server",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "franc": "^6.2.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5-lts.1",
    "nanoid": "^5.0.4",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## models/index.js — All 5 Mongoose schemas
Build all schemas in one file. Export each one as a named export.

### Complaint schema
```javascript
const historySchema = new mongoose.Schema({
  status: String,
  changed_by: { type: String, default: 'system' },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  ref_no:             { type: String, unique: true, required: true, index: true },
  original_text:      { type: String, required: true },
  translated_text:    { type: String, default: '' },
  detected_language:  { type: String, enum: ['hindi','hinglish','english'], default: 'english' },
  categories:         [String],
  severity:           { type: String, enum: ['Critical','High','Medium','Low'], default: 'Medium' },
  department:         { type: String, default: 'Cyber Crime Cell' },
  bns_sections:       [String],
  victim_email:       { type: String, required: true },
  victim_name:        { type: String, required: true },
  status:             { type: String, enum: ['RECEIVED','ASSIGNED','UNDER_INVESTIGATION','RESOLVED'], default: 'RECEIVED' },
  assigned_officer:   { type: String, default: '' },
  city:               { type: String, default: '' },
  location:           { lat: Number, lng: Number },
  evidence_url:       { type: String, default: '' },
  escalation_sent:    { type: Boolean, default: false },
  history:            [historySchema]
}, { timestamps: true });
```

### Entity schema (for fraud pattern detection)
```javascript
const entitySchema = new mongoose.Schema({
  type:           { type: String, enum: ['phone','upi_id','url','email','bank_account'] },
  value:          { type: String, required: true },
  complaint_refs: [String],
  count:          { type: Number, default: 1 },
  first_seen:     { type: Date, default: Date.now },
  last_seen:      { type: Date, default: Date.now }
}, { timestamps: true });
entitySchema.index({ value: 1, type: 1 }, { unique: true });
```

### FraudPattern, ScamAlert, KnowledgeArticle schemas
Follow the field definitions in gemini.md exactly.

## routes/complaints.js — Most important route file

### POST /api/complaints/classify
Step by step:
1. Validate req.body: text, email, name are required — return 400 if missing
2. Sanitize text: trim, remove script tags, limit to 2000 chars
3. Call detectLanguage(text) from utils/langDetect.js
4. Call translateToEnglish(text, lang) — skips if already english
5. Call classifyWithZephyr(english_text) from utils/huggingface.js
6. Parse result: categories[], severity, optional department
7. Call getBnsSections(categories) from utils/bnsMapper.js
8. Call getDepartment(categories) from utils/bnsMapper.js
9. Generate ref_no: const { nanoid } = await import('nanoid'); ref_no = `FIR-${nanoid(8).toUpperCase()}`
10. Create complaint in MongoDB with all fields + initial history entry
11. ASYNC (do not await): extractAndStoreEntities(text, ref_no)
12. ASYNC (do not await): Promise.all([sendWelcomeEmail(email, data), sendFirEmail(email, data)])
13. Return 200 with ref_no, categories, severity, department, bns_sections, detected_language, confidence, email_sent: true

### GET /api/complaints/:ref_no
1. Find complaint by ref_no
2. Exclude victim_email from response (.select('-victim_email -__v'))
3. Return 404 if not found
4. Return complaint document with history[]

### POST /api/complaints/update (admin JWT)
1. Validate ref_no, status in allowed values
2. findOneAndUpdate: set status, assigned_officer, push to history[]
3. Return updated document

## utils/huggingface.js — Zephyr 7B integration
Read ml-integration.md for the complete implementation.
Key points:
- POST to https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta
- Authorization: Bearer ${process.env.HF_API_TOKEN}
- timeout: 30000 (30 seconds)
- On 503: model is loading — wait 20s and retry (max 2 retries)
- Parse response text as JSON — use regex fallback if JSON.parse fails
- If all retries fail: use keywordFallbackClassifier(text)

## utils/bnsMapper.js — Complete BNS 2024 mapping
```javascript
export const BNS_SECTIONS = {
  'Cybercrime/Hacking':  ['IT Act §66 - Hacking', 'IT Act §43 - Damage to Computer', 'BNS 2024 §111 - Organised Cybercrime'],
  'Fraud/Deception':     ['BNS 2024 §318 - Cheating', 'BNS 2024 §318(4) - Cheating with Delivery'],
  'Identity Theft':      ['IT Act §66C - Identity Theft', 'BNS 2024 §319 - Cheating by Impersonation'],
  'Harassment':          ['BNS 2024 §351 - Criminal Intimidation', 'BNS 2024 §352 - Intentional Insult'],
  'Stalking':            ['BNS 2024 §78 - Stalking'],
  'Extortion/Blackmail': ['BNS 2024 §308 - Extortion', 'BNS 2024 §309 - Punishment for Extortion'],
  'Domestic Violence':   ['BNS 2024 §85 - Cruelty by Husband', 'Protection of Women from DV Act 2005'],
  'Sexual Assault':      ['BNS 2024 §64 - Rape', 'BNS 2024 §74 - Assault on Woman'],
  'Robbery':             ['BNS 2024 §309 - Robbery', 'BNS 2024 §296 - Robbery with Hurt'],
  'Kidnapping':          ['BNS 2024 §137 - Kidnapping', 'BNS 2024 §140 - Kidnapping for Ransom'],
  'Homicide':            ['BNS 2024 §101 - Murder', 'BNS 2024 §105 - Culpable Homicide'],
  'Attempted Murder':    ['BNS 2024 §109 - Attempt to Murder'],
  'Burglary':            ['BNS 2024 §305 - Theft in Dwelling', 'BNS 2024 §331 - House Trespass'],
  'Larceny/Theft':       ['BNS 2024 §303 - Theft', 'BNS 2024 §304 - Snatching'],
  'Motor Vehicle Theft': ['BNS 2024 §303 - Theft', 'Motor Vehicles Act 1988'],
  'Arson':               ['BNS 2024 §324 - Mischief by Fire', 'BNS 2024 §325 - Mischief by Fire on Dwelling'],
  'Drug Trafficking':    ['NDPS Act §20 - Production/Sale', 'BNS 2024 §111 - Organised Drug Crime'],
  'Drug Possession':     ['NDPS Act §27 - Possession'],
  'Embezzlement':        ['BNS 2024 §316 - Criminal Breach of Trust'],
  'Weapons Offenses':    ['Arms Act §25 - Unlicensed Arms'],
  'Traffic/DUI':         ['Motor Vehicles Act §185 - DUI', 'BNS 2024 §281 - Rash Driving'],
  'Hit and Run':         ['Motor Vehicles Act §161 - Hit & Run', 'BNS 2024 §106 - Death by Negligence'],
  'Aggravated Assault':  ['BNS 2024 §117 - Grievous Hurt', 'BNS 2024 §118(3) - Grievous Hurt by Weapon'],
  'Simple Assault':      ['BNS 2024 §115 - Voluntarily Causing Hurt'],
  'Vandalism/Property Damage': ['BNS 2024 §324 - Mischief causing Damage'],
  'Trespassing':         ['BNS 2024 §329(3) - Criminal Trespass'],
  'Disorderly Conduct':  ['BNS 2024 §223 - Public Nuisance'],
};

export const DEPARTMENT_MAP = {
  'Cybercrime/Hacking':    'Cyber Crime Cell',
  'Identity Theft':        'Cyber Crime Cell',
  'Fraud/Deception':       'Economic Offences Wing',
  'Embezzlement':          'Economic Offences Wing',
  'Drug Trafficking':      'Narcotics Control Bureau',
  'Drug Possession':       'Narcotics Control Bureau',
  'Homicide':              'Criminal Investigation Department',
  'Attempted Murder':      'Criminal Investigation Department',
  'Kidnapping':            'Criminal Investigation Department',
  'Sexual Assault':        'Women Safety Wing',
  'Domestic Violence':     'Women Safety Wing',
  'Stalking':              'Women Safety Wing',
  'Weapons Offenses':      'Special Weapons Task Force',
  'Traffic/DUI':           'Traffic Police',
  'Hit and Run':           'Traffic Police',
};

export const CITY_COORDS = {
  'Hyderabad':  { lat: 17.385,  lng: 78.4867 },
  'Mumbai':     { lat: 19.076,  lng: 72.8777 },
  'Delhi':      { lat: 28.7041, lng: 77.1025 },
  'Bengaluru':  { lat: 12.9716, lng: 77.5946 },
  'Chennai':    { lat: 13.0827, lng: 80.2707 },
  'Kolkata':    { lat: 22.5726, lng: 88.3639 },
  'Pune':       { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad':  { lat: 23.0225, lng: 72.5714 },
  'Jaipur':     { lat: 26.9124, lng: 75.7873 },
  'Lucknow':    { lat: 26.8467, lng: 80.9462 },
};

export function getBnsSections(categories) {
  const sections = new Set();
  categories.forEach(cat => (BNS_SECTIONS[cat] || ['IT Act §66']).forEach(s => sections.add(s)));
  return [...sections];
}

export function getDepartment(categories) {
  for (const cat of categories) {
    if (DEPARTMENT_MAP[cat]) return DEPARTMENT_MAP[cat];
  }
  return 'Cyber Crime Cell';
}

export function getCityCoords(city) {
  return CITY_COORDS[city] || { lat: 20.5937, lng: 78.9629 };
}
```

## utils/langDetect.js — Language detection using franc
```javascript
import { franc } from 'franc';

const HINGLISH_KEYWORDS = [
  'mera','meri','mere','kiya','gaya','gayi','hai','tha','thi','aur',
  'nahi','bahut','kya','ke','ka','ki','ne','ko','se','pe','par',
  'wala','wali','hoga','hua','hui','raha','rahi','liya','liye',
  'ghuskar','chura','nikala','lagaya','bheja','sir','sahib',
  'paisa','paise','rupee','rupaye','bank','account','phone','mobile'
];

export function detectLanguage(text) {
  if (!text) return 'english';
  // Check Devanagari script (Hindi)
  if (/[\u0900-\u097F]/.test(text)) return 'hindi';
  // Check Hinglish keywords
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter(w => HINGLISH_KEYWORDS.includes(w.replace(/[.,!?;:]/g, ''))).length;
  if (matches >= 2) return 'hinglish';
  // Use franc for other cases
  const detected = franc(text, { minLength: 10 });
  if (detected === 'hin') return 'hindi';
  return 'english';
}

export async function translateToEnglish(text, lang) {
  if (lang === 'english') return text;
  try {
    const { Translator } = await import('googletrans');
    const translator = new Translator();
    const result = await translator.translate(text, { from: 'hi', to: 'en' });
    return result.text;
  } catch (err) {
    console.log('Translation failed, returning original:', err.message);
    return text;
  }
}
```

## utils/emailSender.js — FIR email system
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

export async function sendWelcomeEmail(to, data) {
  const { ref_no, categories, severity, createdAt } = data;
  // HTML email with acknowledgement, ref_no, next steps, 1930 helpline
  // Keep it clean and professional — dark-ish email template
  const html = buildWelcomeHTML(ref_no, categories, severity);
  await transporter.sendMail({
    from: `CyberShield <${process.env.GMAIL_USER}>`,
    to,
    subject: `Complaint registered — Ref: ${ref_no}`,
    html
  });
}

export async function sendFirEmail(to, data) {
  const html = buildFirHTML(data);
  await transporter.sendMail({
    from: `CyberShield <${process.env.GMAIL_USER}>`,
    to,
    subject: `[${data.severity} Priority] Your FIR Document — ${data.ref_no}`,
    html
  });
}

function buildFirHTML(data) {
  // Professional HTML FIR with:
  // - Dark header with "First Information Report" title
  // - Severity color bar (red/amber/yellow/green)
  // - Table: ref_no, categories, severity, department, BNS sections, complaint text
  // - Victim guidance steps
  // - Emergency helplines: 1930, 112, 181, 1091
  // - Signature line for officer
  // Full HTML template — at least 200 lines of clean HTML+inline CSS
  return `<!-- FIR HTML template here -->`;
}
```

## utils/patternDetector.js — Fraud pattern detection
```javascript
import { Entity, FraudPattern } from '../models/index.js';

const PATTERNS = [
  { type: 'phone',        regex: /(?:\+91|0)?[6-9]\d{9}/g },
  { type: 'upi_id',       regex: /[\w.\-]+@(?:oksbi|ybl|ibl|axl|paytm|upi|icici|sbi|hdfc|okaxis|okicici)/g },
  { type: 'url',          regex: /https?:\/\/[^\s]+/g },
  { type: 'email',        regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { type: 'bank_account', regex: /\b\d{9,18}\b/g },
];

const THRESHOLD = 3; // complaints sharing same entity = fraud pattern

export async function extractAndStoreEntities(text, refNo) {
  for (const { type, regex } of PATTERNS) {
    const matches = [...new Set(text.match(regex) || [])];
    for (const value of matches) {
      await Entity.findOneAndUpdate(
        { type, value },
        { $addToSet: { complaint_refs: refNo }, $inc: { count: 1 }, $set: { last_seen: new Date() }, $setOnInsert: { first_seen: new Date() } },
        { upsert: true }
      );
      // Check if threshold reached
      const entity = await Entity.findOne({ type, value });
      if (entity && entity.count >= THRESHOLD) {
        await FraudPattern.findOneAndUpdate(
          { entity_value: value, entity_type: type },
          { $set: { complaint_count: entity.count, status: 'ACTIVE' }, $addToSet: { complaints: refNo }, $setOnInsert: { pattern_id: `PAT-${Date.now()}`, severity: 'HIGH' } },
          { upsert: true }
        );
      }
    }
  }
}
```

## utils/escalation.js — Auto-escalation cron job
```javascript
import nodemailer from 'nodemailer';
import { Complaint } from '../models/index.js';

export async function checkEscalations() {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const cases = await Complaint.find({
    severity: { $in: ['Critical', 'High'] },
    status: 'RECEIVED',
    escalation_sent: false,
    createdAt: { $lt: thirtyMinAgo }
  });
  for (const complaint of cases) {
    // Send escalation email to ADMIN_EMAIL
    // Mark escalation_sent: true
    await Complaint.findByIdAndUpdate(complaint._id, { escalation_sent: true });
  }
}
```

## middleware/auth.js — JWT verification
```javascript
import jwt from 'jsonwebtoken';

export function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Not admin');
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

## routes/admin.js — Admin login
```javascript
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, expires_in: '24h' });
});

export default router;
```

## routes/analytics.js — MongoDB aggregation pipelines
```javascript
// All 4 aggregation pipelines using Promise.all for parallel execution
const [categories, monthly, severity, cities] = await Promise.all([
  Complaint.aggregate([
    { $unwind: '$categories' },
    { $group: { _id: '$categories', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 10 },
    { $project: { name: '$_id', count: 1, _id: 0 } }
  ]),
  Complaint.aggregate([
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 },
    { $project: { month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] }, count: 1, _id: 0 } }
  ]),
  Complaint.aggregate([
    { $group: { _id: '$severity', count: { $sum: 1 } } },
    { $project: { level: '$_id', count: 1, _id: 0 } }
  ]),
  Complaint.aggregate([
    { $match: { city: { $ne: '' } } },
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 10 },
    { $project: { city: '$_id', count: 1, _id: 0 } }
  ])
]);

// Calculate trend: % change from last month to this month
const len = monthly.length;
const trend = len >= 2
  ? Math.round(((monthly[len-1].count - monthly[len-2].count) / monthly[len-2].count) * 100)
  : 0;
```

## Testing the backend
After building, test these curl commands in order:

1. Health check:
   curl http://localhost:5000/health

2. Admin login:
   curl -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d '{"password":"yourpassword"}'
   → Save the token from response

3. Classify a complaint:
   curl -X POST http://localhost:5000/api/complaints/classify -H "Content-Type: application/json" -d '{"text":"Sir mera bank account hack ho gaya aur Rs 45000 nikal gaye","email":"test@test.com","name":"Test User","city":"Hyderabad"}'
   → Should return ref_no, categories, severity, bns_sections

4. Check case status:
   curl http://localhost:5000/api/complaints/FIR-XXXXXXXX
   (use the ref_no from step 3)

5. Get dashboard:
   curl http://localhost:5000/api/dashboard -H "Authorization: Bearer <token_from_step_2>"

If all 5 pass — backend is complete.
