# CyberShield — API Contract
# All 15 Express routes. Frontend reads this to know exact endpoints, payloads, and responses.
# Backend reads this to know what to build.
# Base URL: http://localhost:5000 (dev) / https://your-app.onrender.com (prod)
# Frontend uses: import.meta.env.VITE_API_URL as base

## Authentication
Admin routes require: Authorization: Bearer <jwt_token> header
JWT stored in: localStorage key "cybershield_admin_token"
JWT expiry: 24 hours
Citizen routes: no auth required (victims track by ref_no only)

---

## Route 1 — Submit complaint (core ML pipeline)
POST /api/complaints/classify

Request body:
{
  "text": "Sir mera bank account hack ho gaya aur Rs 45000 nikal gaye",
  "email": "victim@email.com",
  "name": "Rahul Sharma",
  "city": "Hyderabad",
  "evidence_url": "https://res.cloudinary.com/..." (optional)
}

Success response (200):
{
  "ref_no": "FIR-A3X9K2M1",
  "categories": ["Fraud/Deception", "Cybercrime/Hacking"],
  "severity": "High",
  "department": "Economic Offences Wing",
  "bns_sections": ["BNS 2024 §318 - Cheating", "IT Act §66 - Hacking"],
  "detected_language": "hinglish",
  "confidence": "72.4%",
  "victim_guidance": ["Block your account immediately", "Call 1930"],
  "email_sent": true
}

Error response (400): { "error": "text, email, and name are required" }
Error response (500): { "error": "Classification failed. Please try again." }

Notes:
- This route triggers the full ML pipeline (see ml-integration.md)
- Fires 2 emails async (does not block response)
- Saves to MongoDB complaints collection
- Triggers extractAndStoreEntities() async (does not block)
- Takes 10-15 seconds due to HuggingFace inference

---

## Route 2 — Get case status (public, no auth)
GET /api/complaints/:ref_no

Example: GET /api/complaints/FIR-A3X9K2M1

Success response (200):
{
  "ref_no": "FIR-A3X9K2M1",
  "categories": ["Fraud/Deception"],
  "severity": "High",
  "department": "Economic Offences Wing",
  "bns_sections": ["BNS 2024 §318"],
  "status": "ASSIGNED",
  "assigned_officer": "Insp. Sharma",
  "city": "Hyderabad",
  "createdAt": "2026-03-18T10:30:00Z",
  "updatedAt": "2026-03-18T11:45:00Z",
  "history": [
    { "status": "RECEIVED", "changed_by": "system", "note": "Complaint submitted", "timestamp": "..." },
    { "status": "ASSIGNED", "changed_by": "Insp. Sharma", "note": "Case assigned", "timestamp": "..." }
  ]
}

Error response (404): { "error": "Case not found" }

Notes:
- victim_email is intentionally excluded from this response
- Frontend polls this every 30s on the /track/:ref_no page

---

## Route 3 — Update case status (admin only)
POST /api/complaints/update
Headers: Authorization: Bearer <token>

Request body:
{
  "ref_no": "FIR-A3X9K2M1",
  "status": "UNDER_INVESTIGATION",
  "assigned_officer": "Insp. Meera Singh",
  "note": "Case forwarded to cyber cell"
}

Success response (200):
{
  "ref_no": "FIR-A3X9K2M1",
  "status": "UNDER_INVESTIGATION",
  "assigned_officer": "Insp. Meera Singh",
  "updatedAt": "..."
}

Allowed status values: RECEIVED, ASSIGNED, UNDER_INVESTIGATION, RESOLVED

---

## Route 4 — Admin dashboard (admin only)
GET /api/dashboard
Headers: Authorization: Bearer <token>

Success response (200):
{
  "complaints": [ /* array of last 100 complaint objects */ ],
  "stats": {
    "total": 142,
    "critical": 8,
    "high": 23,
    "medium": 47,
    "low": 64,
    "resolved": 91
  },
  "patterns": [
    {
      "pattern_id": "PAT-001",
      "entity_type": "upi_id",
      "entity_value": "abc@oksbi",
      "complaint_count": 7,
      "severity": "HIGH"
    }
  ]
}

---

## Route 5 — Analytics data (admin only)
GET /api/analytics
Headers: Authorization: Bearer <token>

Success response (200):
{
  "categories": [
    { "name": "Fraud/Deception", "count": 45 },
    { "name": "Cybercrime/Hacking", "count": 32 }
  ],
  "monthly": [
    { "month": "2026-1", "count": 18 },
    { "month": "2026-2", "count": 24 },
    { "month": "2026-3", "count": 31 }
  ],
  "severity": [
    { "level": "Critical", "count": 8 },
    { "level": "High", "count": 23 }
  ],
  "cities": [
    { "city": "Hyderabad", "count": 34 },
    { "city": "Mumbai", "count": 28 }
  ],
  "trend": 29
}

Notes:
- trend is % change from previous month (positive = up, negative = down)

---

## Route 6 — Heatmap data (public)
GET /api/heatmap

Success response (200):
[
  { "city": "Hyderabad", "lat": 17.385, "lng": 78.4867, "count": 34 },
  { "city": "Mumbai",    "lat": 19.076, "lng": 72.8777, "count": 28 }
]

Notes:
- Frontend feeds this array into Leaflet leaflet.heat plugin
- Format: [[lat, lng, intensity], ...] — convert count to 0-1 intensity

---

## Route 7 — Active scam alerts (public)
GET /api/alerts/active

Success response (200):
[
  {
    "_id": "...",
    "title": "Loan app fraud campaign",
    "description": "23 complaints in Hyderabad today",
    "severity": "High",
    "affected_cities": ["Hyderabad", "Bengaluru"],
    "scam_type": "Loan App Fraud",
    "published_at": "..."
  }
]

Notes:
- Returns max 3 alerts
- Frontend checks this on every page load via Layout component
- Shows dismissible red banner at top if array is not empty

---

## Route 8 — Create scam alert (admin only)
POST /api/alerts
Headers: Authorization: Bearer <token>

Request body:
{
  "title": "New UPI fraud wave",
  "description": "Reports of fake UPI collect requests from unknown numbers",
  "severity": "High",
  "affected_cities": ["Delhi", "Mumbai"],
  "scam_type": "UPI Fraud"
}

Success response (200): created alert object

---

## Route 9 — Toggle alert publish/unpublish (admin only)
PATCH /api/alerts/:id/toggle
Headers: Authorization: Bearer <token>

Success response (200): { "is_active": true, "published_at": "..." }

---

## Route 10 — Article list (public)
GET /api/articles

Query params (optional):
  ?category=phishing
  ?limit=10
  ?page=1

Success response (200):
{
  "articles": [
    {
      "slug": "how-upi-fraud-works",
      "title": "How UPI Fraud Works and How to Protect Yourself",
      "category": "upi_fraud",
      "tags": ["UPI", "fraud", "prevention"],
      "published_at": "...",
      "views": 234
    }
  ],
  "total": 15
}

Notes: content_markdown is excluded from list response (only in detail)

---

## Route 11 — Single article (public)
GET /api/articles/:slug

Example: GET /api/articles/how-upi-fraud-works

Success response (200):
{
  "slug": "how-upi-fraud-works",
  "title": "How UPI Fraud Works and How to Protect Yourself",
  "category": "upi_fraud",
  "content_markdown": "## Introduction\n\n...",
  "tags": ["UPI", "fraud"],
  "published_at": "...",
  "views": 235
}

Notes: views is automatically incremented on each GET

---

## Route 12 — Create article manually (admin only)
POST /api/articles
Headers: Authorization: Bearer <token>

Request body:
{
  "title": "How to Identify Phishing Emails",
  "category": "phishing",
  "content_markdown": "## Introduction\n\n...",
  "tags": ["phishing", "email", "security"]
}

Notes: slug is auto-generated from title

---

## Route 13 — Generate article with Claude (admin only)
POST /api/articles/generate
Headers: Authorization: Bearer <token>

Request body:
{
  "topic": "UPI fraud targeting elderly people in India"
}

Success response (200):
{
  "content": "## Introduction\n\nUPI fraud has been rising sharply...\n\n## Prevention Tips\n..."
}

Notes:
- Returns draft content only — admin must review and POST to /api/articles to publish
- Uses Anthropic claude-sonnet-4-20250514
- Content is in Markdown format

---

## Route 14 — CyberBot chat (public)
POST /api/chat

Request body:
{
  "message": "Mera UPI fraud hua hai, kya karoon?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Namaste! Main CyberBot hoon..." }
  ]
}

Success response (200):
{
  "reply": "UPI fraud ke liye aapko immediately: 1. Apna bank call karke account block karwayein. 2. 1930 par call karein (National Cyber Crime Helpline). 3. CyberShield par complaint file karein..."
}

Notes:
- history should contain last 8 messages only (frontend manages this)
- Bot responds in Hinglish if user writes in Hinglish

---

## Route 15 — Admin login
POST /api/admin/login

Request body:
{
  "password": "your_admin_password"
}

Success response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": "24h"
}

Error response (401): { "error": "Invalid credentials" }

Notes:
- Token stored in localStorage as "cybershield_admin_token"
- All admin routes check this via verifyAdmin middleware
- No username — password-only auth for simplicity

---

## Frontend API helper (client/src/lib/api.ts)
All calls must go through this file. Never write axios directly in page components.

```typescript
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE });

// Add JWT token to admin requests automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cybershield_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const classifyComplaint = (data: ComplaintPayload) =>
  api.post('/api/complaints/classify', data);

export const getCaseStatus = (ref_no: string) =>
  api.get(`/api/complaints/${ref_no}`);

export const updateCaseStatus = (data: StatusUpdatePayload) =>
  api.post('/api/complaints/update', data);

export const getDashboard = () =>
  api.get('/api/dashboard');

export const getAnalytics = () =>
  api.get('/api/analytics');

export const getHeatmapData = () =>
  api.get('/api/heatmap');

export const getActiveAlerts = () =>
  api.get('/api/alerts/active');

export const createAlert = (data: AlertPayload) =>
  api.post('/api/alerts', data);

export const toggleAlert = (id: string) =>
  api.patch(`/api/alerts/${id}/toggle`);

export const getArticles = (params?: ArticleQueryParams) =>
  api.get('/api/articles', { params });

export const getArticle = (slug: string) =>
  api.get(`/api/articles/${slug}`);

export const createArticle = (data: ArticlePayload) =>
  api.post('/api/articles', data);

export const generateArticle = (topic: string) =>
  api.post('/api/articles/generate', { topic });

export const chatWithBot = (message: string, history: ChatMessage[]) =>
  api.post('/api/chat', { message, history });

export const adminLogin = (password: string) =>
  api.post('/api/admin/login', { password });
```
