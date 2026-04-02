# CyberShield — Master Project Context
# Read this file before doing ANYTHING. Every agent must read this first.

## What this project is
CyberShield is a full-stack AI-powered cybercrime intelligence platform for India.
Citizens file complaints in Hindi, Hinglish, or English.
The system classifies the complaint using Zephyr 7B, maps BNS 2024 legal sections,
routes to the correct police department, generates a professional FIR HTML document,
and sends 2 emails to the victim — all within 15 seconds.

## Tech stack — do not deviate from this
- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Routing: React Router v6 (client-side, App.tsx handles all routes)
- Backend: Node.js + Express 4 (ESModules — "type": "module" in package.json)
- Database: MongoDB Atlas M0 via Mongoose ODM
- ML: HuggingFace Inference API (Zephyr 7B) called via axios — ZERO Python on server
- AI Chatbot: Google Gemini API gemini-1.5-flash (CyberBot chatbot + article generation)
  Package: @google/generative-ai
  Key: process.env.GEMINI_API_KEY (from aistudio.google.com)
- Email: Nodemailer + Gmail SMTP SSL port 465
- Auth: JWT tokens + bcrypt (admin only)
- File Upload: Cloudinary npm package
- 3D Globe: globe.gl
- Charts: Recharts + D3.js
- Graph: react-force-graph-2d
- Animations: Framer Motion + typed.js
- Scheduling: node-cron (escalation every 5 min)
- Lang Detection: franc npm package
- Frontend Deploy: Vercel
- Backend Deploy: Render
- DB: MongoDB Atlas M0 free tier

## Absolute coding rules — never break these
1. Use ESModules (import/export) — NEVER use require() anywhere
2. Use async/await — NEVER use callbacks
3. All colors from brandguidelines.md — NEVER hardcode other hex values
4. All API calls go in client/src/lib/api.js — never write axios directly in components
5. Admin JWT passed as: Authorization: Bearer <token> in headers
6. Victims need NO login to track cases using ref_no
7. Use nanoid for ref_no generation — NOT uuid
8. Use franc for language detection — NOT Google Translate for detection
9. Tailwind + shadcn/ui ONLY — no inline styles except dynamic values
10. TypeScript on frontend — all props must have types
11. Never overwrite existing files without reading them first
12. Never install packages not in this list without asking

## Project folder structure
```
cybershield/
├── gemini.md              ← this file
├── brandguidelines.md     ← UI/UX rules
├── api-contract.md        ← all 15 API routes
├── backend.md             ← backend build instructions
├── ml-integration.md      ← ML pipeline instructions
├── client/                ← React + Vite frontend
│   ├── src/
│   │   ├── pages/         ← 15 page components
│   │   ├── components/
│   │   │   ├── layout/    ← Navbar, AlertBanner, CyberBot, Layout
│   │   │   ├── complaint/ ← ComplaintForm, LangBadge, ScanAnimation
│   │   │   ├── result/    ← FIRResultCard, SeverityBadge, BNSPill
│   │   │   ├── admin/     ← StatCard, CasesTable, RadarChart
│   │   │   └── shared/    ← StatusTimeline, GlobeMap, ArticleCard
│   │   ├── lib/
│   │   │   ├── api.ts     ← ALL axios calls here
│   │   │   └── auth.ts    ← JWT read/write localStorage
│   │   ├── types/
│   │   │   └── index.ts   ← all TypeScript interfaces
│   │   └── App.tsx        ← all routes defined here
│   └── package.json
└── server/                ← Express backend
    ├── models/index.js    ← all 5 Mongoose schemas
    ├── routes/            ← all Express routes
    ├── utils/             ← huggingface.js, bnsMapper.js, etc.
    ├── middleware/auth.js ← JWT verifyAdmin
    ├── server.js          ← entry point
    └── .env               ← never commit this
```

## MongoDB collections — exact field names
```
complaints:
  ref_no (String, unique), original_text (String), translated_text (String),
  detected_language (String: hindi/hinglish/english), categories (Array),
  severity (String: Critical/High/Medium/Low), department (String),
  bns_sections (Array), victim_email (String), victim_name (String),
  status (String: RECEIVED/ASSIGNED/UNDER_INVESTIGATION/RESOLVED),
  assigned_officer (String), city (String), location {lat, lng},
  escalation_sent (Boolean, default false), history (Array of objects),
  createdAt, updatedAt

entities:
  type (String: phone/upi_id/url/email/bank_account),
  value (String), complaint_refs (Array), count (Number),
  first_seen (Date), last_seen (Date)

fraud_patterns:
  pattern_id (String, unique), entity_type (String), entity_value (String),
  complaint_count (Number), severity (String), status (String: ACTIVE/RESOLVED),
  complaints (Array)

scam_alerts:
  title (String), description (String), severity (String),
  affected_cities (Array), scam_type (String), is_active (Boolean),
  created_by (String), published_at (Date)

knowledge_articles:
  slug (String, unique), title (String), category (String),
  content_markdown (String), tags (Array), published_at (Date), views (Number)

users:
  email (String, unique), password_hash (String), name (String),
  role (String: user/admin), language_pref (String)
```

## All pages — exact routes
Public (no login):
  / → Landing page
  /login → Login / Signup
  /how-it-works → Pipeline explainer
  /helplines → Emergency helplines
  /hub → Knowledge hub article list
  /hub/:slug → Single article
  /status → Public case tracker entry

Citizen (login required):
  /complaint → File complaint (3-step wizard)
  /result → FIR result display
  /track/:ref_no → Live case tracker (auto-polls every 30s)
  /my-complaints → All complaints by this user
  /notifications → Notification center
  /profile → User profile

Admin (admin JWT required):
  /admin/login → Admin login
  /admin → SOC dashboard
  /admin/cases → All complaints table
  /admin/case/:ref → Case detail + status update
  /analytics → Charts dashboard
  /heatmap → Leaflet India heatmap
  /fraud-network → Fraud graph visualization
  /admin/alerts → Scam alert management
  /admin/articles → Knowledge hub CMS

## Environment variables (server/.env)
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=random_string_min_32_chars
ADMIN_PASSWORD=your_admin_password
CLIENT_URL=http://localhost:5173
HF_API_TOKEN=hf_xxxxx
HF_MODEL_ID=HuggingFaceH4/zephyr-7b-beta
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_app_password_16_chars
ADMIN_EMAIL=your_personal_email@gmail.com
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

## When you are stuck
- If a package install fails: check package.json list first, use exact versions
- If MongoDB connection fails: check MONGODB_URI has correct password, no special chars
- If HuggingFace returns 503: model is loading, retry after 20 seconds
- If email fails: check Gmail App Password (not regular password), must be 16 chars
- If TypeScript errors: check client/src/types/index.ts for missing interfaces
- Never delete existing working code to fix a problem — always add/patch
