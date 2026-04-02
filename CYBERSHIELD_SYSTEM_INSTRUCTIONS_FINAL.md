# System Instructions: CyberShield — AI-Powered Cybercrime Intelligence Platform
# Version: 2.0 FINAL
# Read this file completely before writing a single line of code.
# This is the single source of truth for the entire project.

---

## Project Overview

Build a **full-stack AI-powered cybercrime complaint and intelligence platform** for
Indian citizens and police officers. Citizens file complaints in Hindi, Hinglish, or
English and receive an automated FIR document by email within 15 seconds. Police
officers get a Security Operations Center (SOC) dashboard to manage complaints, run
investigations, view fraud networks, and publish scam alerts.

The platform is split into two distinct experiences:
1. **Citizen Portal** — clean, accessible, multilingual complaint filing and tracking
2. **Admin SOC** — dark cybersecurity intelligence platform for officers

---

## Tech Stack

### Frontend
- React + Vite + TypeScript
- Tailwind CSS (darkMode: 'class') + shadcn/ui
- React Router v6
- Framer Motion (page transitions + animations)
- @splinetool/react-spline (3D hero model on landing page)
- globe.gl (3D rotating cybercrime heatmap globe)
- react-leaflet + leaflet.heat (India flat heatmap)
- react-force-graph-2d (fraud network graph)
- Recharts + D3.js (analytics charts)
- typed.js (hacker terminal animation)
- Lucide React (ALL icons — no emoji anywhere)
- react-markdown (Knowledge Hub article rendering)

### Backend
- Node.js 18 + Express 4 (ESModules — "type": "module")
- Mongoose ODM + MongoDB Atlas M0
- node-cron (escalation every 5 min)
- Nodemailer + Gmail SMTP SSL port 465
- jsonwebtoken + bcryptjs (admin auth)
- nanoid (FIR reference number generation)
- franc (offline language detection)
- express-rate-limit
- Cloudinary (evidence uploads)
- multer (file handling)

### ML / AI
- HuggingFace Inference API — Zephyr 7B Beta (crime classification)
- Google Gemini API gemini-1.5-flash (CyberBot chatbot + article generation)
  Package: @google/generative-ai
  Key: process.env.GEMINI_API_KEY (from aistudio.google.com)
- Google Translate API via googletrans (translation)

### Deployment
- Frontend: Vercel (free hobby tier)
- Backend: Render (free tier)
- Database: MongoDB Atlas M0 (free, 512MB)

---

## Theme System — DUAL MODE (Dark + Light)

### Implementation
```javascript
// tailwind.config.js
module.exports = { darkMode: 'class', ... }

// ThemeProvider stores in localStorage key: 'cybershield-theme'
// Default: 'dark'
// Toggle adds/removes 'dark' class on <html> element
// Smooth transition: 0.3s ease on all color properties
```

### Dark Mode Colors (Default — SOC aesthetic)
```
--bg-primary:    #0A0F1E   page root
--bg-surface:    #0D1526   cards, panels, forms
--bg-elevated:   #1E293B   table rows, inputs, hover
--bg-overlay:    #0F172A   modals, dropdowns
--cyan:          #00D4FF   primary accent
--violet:        #7C3AED   AI / secondary accent
--text-primary:  #E2E8F0
--text-secondary:#94A3B8
--text-muted:    #64748B
--border:        rgba(255,255,255,0.08)
```

### Light Mode Colors (Clean professional)
```
--bg-primary:    #F8FAFC   page root
--bg-surface:    #FFFFFF   cards, panels
--bg-elevated:   #F1F5F9   table rows, inputs
--bg-overlay:    #FFFFFF   modals
--cyan:          #0099BB   primary accent (darker for contrast)
--violet:        #6D28D9   AI accent
--text-primary:  #0F172A
--text-secondary:#475569
--text-muted:    #94A3B8
--border:        rgba(0,0,0,0.08)
```

### Admin Sidebar — ALWAYS DARK regardless of mode
```
background: #0F172A  (intentional — creates visual separation in light mode)
```

### Severity Colors — Same in both modes
```
Critical: #EF4444    High: #F59E0B    Medium: #EAB308    Low: #22C55E
```

### Theme Toggle in Navbar
- Sun icon (light mode) / Moon icon (dark mode) from Lucide React
- Smooth 0.3s transition on background-color, color, border-color
- Position: right side of navbar next to notification bell

---

## Navigation Structure

### Public Navbar
- Left: CyberShield logo (shield icon + wordmark in cyan)
- Center: Home · How It Works · Helplines · Knowledge Hub
- Right: Theme toggle (Sun/Moon) · Login button (outlined) · File Complaint (filled cyan)
- Mobile: hamburger menu

### Citizen Navbar (logged in)
- Same center links
- Right: Theme toggle · Bell with red count badge · Avatar dropdown
- Dropdown: My Complaints · Profile · Logout

### Admin Sidebar (always dark #0F172A)
```
Logo + "SOC Command" subtitle at top
─────────────────────────────────
[LayoutDashboard]  Dashboard
[FileText]         Complaints
[Search]           Investigations   ← NEW from Stitch inspiration
[BarChart2]        Analytics
[Map]              Heatmap
[Network]          Fraud Network
[AlertTriangle]    Alerts
[BookOpen]         Knowledge Hub
─────────────────────────────────
[Settings]         Settings
[LogOut]           Logout
─────────────────────────────────
[Zap] Emergency Response           ← Fixed bottom, violet button
```

Active item: border-left 3px solid #00D4FF, bg rgba(0,212,255,0.08)

---

## Pages — Public

### Page 1: Landing Page — /

**SPLINE 3D MODEL (Hero)**
- Load using @splinetool/react-spline
- Scene URL: from Spline export → Code → React → copy prod.spline.design URL
- Position: right half of hero section (desktop) / hidden on mobile
- Lazy load inside React.Suspense with spinner fallback
- Cover Spline watermark with same-color div (position absolute, bottom-right)
- Vite config: manualChunks for spline bundle separation

```tsx
const Spline = lazy(() => import('@splinetool/react-spline'));
<Suspense fallback={<ShieldLoader />}>
  <Spline scene="https://prod.spline.design/YOUR-ID/scene.splinecode"
          style={{ width: '100%', height: '100%' }} />
</Suspense>
```

**3D ROTATING GLOBE (Stats section)**
- globe.gl library
- backgroundColor: rgba(10,15,30,1)
- atmosphereColor: #00D4FF, atmosphereAltitude: 0.15
- Animated arcs showing cybercrime threat routes between Indian cities
- Arc colors: Critical=#EF4444, High=#F59E0B, Resolved=#22C55E
- City glowing dots in cyan
- Auto-rotate: true, speed: 0.8
- Placed in the stats/metrics section below hero

**DIGITAL RAIN (Authenticated login transition)**
- HTML5 Canvas, full viewport, behind content
- Characters: katakana + numbers + binary + hex
- Head char: white with cyan shadowBlur:8
- Trail: rgba(0,212,255, fading) — 8 chars deep
- On successful login: plays 2s then fadeOut 1.5s → landing appears

**HACKER TERMINAL (Hero section)**
```
typed.js, JetBrains Mono, #00D4FF
Messages (loop):
  "> Monitoring cyber threats..."
  "> AI classification active..."
  "> Fraud patterns detected..."
  "> BNS 2024 sections mapped..."
  "> System online and ready..."
typeSpeed: 40, backSpeed: 20, backDelay: 1500
```

**Layout (top to bottom):**
1. Scam Alert Banner (conditional, from /api/alerts/active)
2. Navbar
3. Hero: left=text+terminal+CTAs, right=Spline 3D model
4. Stats row with 3D Globe: 4 metric cards + rotating globe
5. How It Works: 5-step animated pipeline
6. Emergency Strip: 4 helpline pills
7. Footer

---

### Page 2: Login / Signup — /login
- 3D globe.gl background (lightweight, no arcs — just rotating Earth)
- Centered auth card, frosted glass effect on card only
- Two tabs: Login / Sign Up
- Admin login link below form

---

### Page 3: How It Works — /how-it-works
- 5 expandable step cards
- Step 3 shows neural network canvas animation on expand

---

### Page 4: Emergency Helplines — /helplines
- 4 large colored helpline cards
- State cyber cell directory table
- Official portal links

---

### Page 5: Knowledge Hub — /hub
**Layout inspired by Stitch screenshot (Image 2):**

Full-width header with search bar (placeholder: "Search legal sections, SOPs...")
User info top-right: "Admin User · SOC Level 3" style badge

Category tabs (horizontal, underline style):
- All Resources (default)
- Legal (BNS 2024)
- Investigation SOPs
- Threat Bulletins
- User Guides

Article card grid (3 columns):
- Thumbnail image (from Cloudinary or placeholder)
- Category badge: LEGAL=teal, SOP=violet, THREAT BULLETIN=amber, GUIDE=blue
- Date (e.g. "12 Mar 2026")
- Title (bold, 2 lines max)
- Description excerpt (3 lines, truncated)
- "READ MORE →" link + bookmark icon

Right sidebar (sticky):
- Trending Topics card:
  - Cyan dot + topic name (bold)
  - Gray subtitle (e.g. "142 cases referenced this week")
  - "VIEW ALL TRENDS" link
- Recently Updated card:
  - Article title
  - Category badge (small)
  - "Updated Xh ago" timestamp
- Contribute Knowledge card:
  - "Share your findings or updated SOPs"
  - "SUBMIT ARTICLE" button (cyan outlined)

Fixed bottom-left: "Emergency Response" button (violet, Zap icon)

---

### Page 6: Article Detail — /hub/:slug
- Breadcrumb: Knowledge Hub > Category > Title
- Category badge + published date + view count
- react-markdown rendered content
- Related articles below

---

### Page 7: Public Status Entry — /status
- Large ref_no input + Track button
- No login required

---

## Pages — Citizen (Login Required)

### Page 8: File Complaint — /complaint
**3-Step Wizard**

Step 1 — Complaint Text:
- Large textarea with live language detection badge
- Evidence upload zone: dashed border, scan animation on file select
- "Scan animation": CSS scan line over uploaded file thumbnail
  - Text appears: "Extracting entities... Phone: 9876XXXXX... UPI: abc@oksbi"

Step 2 — Personal Details:
- Name, email, city dropdown (10 cities), phone (optional)

Step 3 — Review & Submit:
- Read-only preview
- On submit: AI Scanning animation (5-step progress bar)
- Neural network canvas during step 3 (Zephyr inference)

---

### Page 9: FIR Result — /result
- Green success banner with ref_no in large monospace cyan
- Category badges, BNS section pills (violet), severity badge
- Victim guidance steps
- "Track My Case →" link

---

### Page 10: Live Case Tracker — /track/:ref_no
- Auto-polls GET /api/complaints/:ref_no every 30s
- 5-stage animated timeline stepper (active stage pulses cyan)
- Officer + department info

---

### Page 11: My Complaints — /my-complaints
- Cards with ref_no, categories, severity, status, date, Track link
- Filter: All / Active / Resolved

---

### Page 12: Notifications — /notifications
- Notification list with icons, titles, timestamps
- Mark all as read button

---

### Page 13: User Profile — /profile
- Avatar with initials, name, email, language preference
- Change password form

---

## Pages — Admin SOC (Admin JWT Required)

### Page 14: Admin Login — /admin/login
- Password-only form
- Shield icon, dark theme always

---

### Page 15: SOC Dashboard — /admin
- 4 stat cards with count-up animation
- Left 60%: cases table with severity + status badges
- Right 40%: mini bar chart + fraud pattern alert cards
- Bottom: active scam alerts panel

---

### Page 16: Complaints Management — /admin/cases
- Full sortable/filterable table
- 20 per page pagination
- Export CSV button

---

### Page 17: Case Investigation Detail — /admin/case/:ref
**Layout inspired by Stitch screenshot (Image 1) — 3-column layout:**

**Header bar:**
- Back arrow + "Case Investigation:" + ref_no in cyan (e.g. FIR-A3X9K2M1)
- Case title (crime type + operation name if applicable)
- Severity badge (CRITICAL in red)
- Action buttons: Assign · Export · Freeze Assets (red, danger)
- Status badge: UNDER_INVESTIGATION with pulsing dot
- Created date + Assigned tier info

**Three-column body:**

LEFT COLUMN — Subject Details:
- Section title "Subject Details" with ··· menu
- Suspect cards (each card):
  - Avatar with initials (2-letter, colored)
  - Name + Risk score badge (e.g. "Risk: 94" in red)
  - Role: PRIMARY / ASSOCIATE / SUSPECT
  - Phone (partially masked: +91 98XXX-XXX12)
  - UPI ID (partially masked)
  - Card border color based on risk score
- "View All Network Nodes" button at bottom

CENTER COLUMN — Evidence Timeline:
- Section title + "Add Entry" button (top right)
- Timeline entries (vertical, connected by line):
  - Each entry: circle dot + timestamp (relative: "10 mins ago")
  - Entry title (bold)
  - Description text
  - Tags/badges (e.g. "Pattern: Smurfing" in amber)
  - Entry types:
    - AI Fraud Pattern Matched (Brain icon, cyan)
    - Call Logs Uploaded (Phone icon)
    - Bank Statement Verified (FileText icon)
    - Evidence Uploaded (Upload icon)
    - Status Changed (RefreshCw icon)
- "Evidence Gallery" section at bottom:
  - Filter buttons: Images · Docs
  - Grid of uploaded evidence thumbnails

RIGHT COLUMN — AI Intelligence:
- "AI Intelligence" header with Brain icon (violet)
- Linked Cases section:
  - Title: "Linked Cases (4)"
  - Each linked case: ref_no in cyan + match % badge
  - e.g. "#DL-2023-F12  88% match" in green
  - e.g. "#MH-2023-K09  62% match" in amber
- Legal Mapping (BNS 2024) section:
  - Each section: bold section number + description text
  - e.g. "Section 318 — Cheating and dishonestly inducing delivery of property"
  - e.g. "Section 66D (IT Act) — Punishment for cheating by personation"
- Location Profile section:
  - Small mini-map (Leaflet, non-interactive, 150px height)
  - Location label below (e.g. "Jamtara Cluster, JH")

**Data sources for this page:**
- complaint document from MongoDB (ref_no lookup)
- fraud_patterns linked by complaint ref_no
- entities extracted from complaint
- history[] array for timeline

---

### Page 18: Analytics Dashboard — /analytics
- Time period selector dropdown
- 4 Recharts panels: bar (categories), line (monthly trend), donut (severity), horizontal bar (cities)
- Trend % indicator card

---

### Page 19: Crime Heatmap — /heatmap
**3D Globe (primary view):**
- globe.gl, full width, dark background
- Glowing city points sized by complaint count
- Animated arcs between cities for active fraud patterns
- Arc colors: Critical=red, High=amber, Low=green
- Click city → filter sidebar updates

**Flat Leaflet map (toggle option):**
- CartoDB dark tiles
- leaflet.heat plugin overlay
- Gradient: blue→amber→red

**Stats sidebar:**
- Top 10 cities ranked by complaint count
- Colored progress bars

---

### Page 20: Fraud Network Graph — /fraud-network
- react-force-graph-2d full canvas
- Entity nodes (cyan, larger): UPI IDs, phones, URLs
- Complaint nodes (violet, smaller): ref_no
- Edges connect complaints to shared entities
- Click node → highlight connected nodes + show detail panel
- Fraud pattern cards below graph

---

### Page 21: Alerts Panel — /admin/alerts
- Active alerts table with toggle switches
- Create Alert form (right panel)
- Severity + cities + scam type inputs

---

### Page 22: Knowledge Hub Admin — /admin/articles
**Layout inspired by Stitch screenshot (Image 2) — same design as public hub:**

Same category tabs, same article cards with thumbnails
Additional admin actions per card:
- Edit button (pencil icon)
- Delete button (trash icon, with confirmation)

Top bar additions:
- "Create Article" button (cyan, filled)
- "Generate with AI" button (violet, Brain icon)
  - Opens topic input dialog
  - Calls POST /api/articles/generate (Google Gemini)
  - Pre-fills editor with generated markdown

Article editor panel (slide-in from right):
- Title input
- Category dropdown
- Tags input
- Markdown textarea (left) + Preview pane (right) — split view
- Publish / Save Draft toggle

Right sidebar additions (admin):
- Contribute Knowledge card shows "Pending Review: 3 submissions"

---

## Global Components (Every Page)

### CyberBot — Floating AI Assistant
```
Position: fixed bottom-right (28px, 28px), z-index: 50
Shape: CSS robot face (SVG), violet #7C3AED, circular base
Size: 56px diameter
Glow: box-shadow 0 0 20px rgba(124,58,237,0.40)
Float: translateY(-4px) 2s ease-in-out infinite
Hover: scale(1.12) + stronger glow
Click: chat panel slides up from bottom-right
```
Chat panel:
- Header: "CyberBot — AI Assistant" + X close button
- Message bubbles: user right (cyan bg), bot left (dark surface)
- Quick reply chips: "How to file FIR?" · "Track my case" · "Emergency helplines" · "What is BNS 2024?"
- Calls POST /api/chat with message + last 8 messages history
- Supports Hinglish — responds in Hinglish if user writes in Hinglish

### Page Loader — Cyber Shield
```
CSS 3D shield (polygon shape)
Color: #00D4FF outline
Rotation: rotateY(360deg), 3s infinite linear
Scan effect: pseudo-element sweeps vertically
Shows during React Router lazy loading transitions
```

### Alert Banner
```
Position: full-width, above navbar
Shown when GET /api/alerts/active returns results
bg: rgba(239,68,68,0.08), border-bottom: 1px solid rgba(239,68,68,0.25)
Pulsing red dot + alert title + "Learn more" link + X dismiss
Dismissed state stored in sessionStorage
```

### Emergency Response Button (Admin pages)
```
Position: fixed bottom-left (16px, 16px), z-index: 40
Violet background #7C3AED, Zap icon
Text: "Emergency Response"
Opens modal with 1930, 112, 181, 1091 quick-dial cards
```

---

## Animation Specifications

### 1. Digital Rain (Login → Landing transition)
```
Canvas: full viewport, z-index behind content
Characters: katakana (ア-ン) + 0-9 + 0,1 + A-F
Head: #FFFFFF with shadowColor:#00D4FF, shadowBlur:8
Trail: rgba(0,212,255,opacity) — 8 chars, fading
Fade BG: rgba(10,15,30,0.05) per frame
On auth success: 2s play → 1.5s fadeOut → landing fadein
```

### 2. Page Shield Loader
```
CSS 3D: rotateY(360deg) 3s linear infinite
Scan: pseudo-element, top→bottom sweep, rgba(0,212,255,0.3)
Shows between route changes (React.lazy Suspense)
```

### 3. AI Scanning (Complaint submission)
```
5-step sequential progress:
  "Detecting Language"      0.5s  → green check
  "Translating to English"  1.0s  → green check
  "AI Classifying..."       10-15s → cyan pulse (actual API call)
  "Mapping BNS 2024"        0.5s  → green check
  "Sending FIR to Email"    1.0s  → green check
Neural network canvas during step 3 (nodes fire amber glow)
```

### 4. Investigation Timeline Stepper
```
5 stages horizontal
Completed: filled green + checkmark glyph
Active: filled cyan + box-shadow pulse 1.5s infinite
Upcoming: outlined gray
Connecting line: cyan for done, gray for pending
```

### 5. Evidence Timeline (Case Detail page)
```
Vertical timeline with connecting line
Each entry slides in from right on load (Framer Motion)
staggered: 0.1s delay per entry
Circle dot: colored by entry type (cyan=AI, amber=evidence, green=verified)
```

### 6. CyberBot Float
```
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
2s ease-in-out infinite
Hover: scale(1.12) + strongerGlow 0.2s ease
```

### 7. Hacker Terminal
```
typed.js: typeSpeed:40 backSpeed:20 backDelay:1500 loop:true
Font: JetBrains Mono 14px, color: #00D4FF
Blinking cursor: |
```

### 8. Count-Up Numbers (Stat cards)
```
requestAnimationFrame, easeOutQuart, 1.2s duration
From 0 to target value on component mount
```

### 9. Fraud Pattern Alert Card (Admin)
```
Entry animation: slideInLeft 0.4s ease
Red left border: 3px solid #EF4444
Pulse: box-shadow 0→8px rgba(239,68,68,0.3)→0 2s infinite
```

### 10. Globe Threat Arcs
```
globe.gl arcs animate automatically
Arc dash: animated stroke-dashoffset
Speed: medium — visible travel path
New arc spawns every ~3 seconds
Max 12 arcs simultaneously
```

---

## Data Model

### complaints collection
```json
{
  "ref_no": "FIR-A3X9K2M1",
  "original_text": "string (max 2000)",
  "translated_text": "string",
  "detected_language": "hindi | hinglish | english",
  "categories": ["string (max 2 items)"],
  "severity": "Critical | High | Medium | Low",
  "department": "string",
  "bns_sections": ["string"],
  "victim_email": "string (never public)",
  "victim_name": "string",
  "status": "RECEIVED | ASSIGNED | UNDER_INVESTIGATION | RESOLVED",
  "assigned_officer": "string",
  "city": "string",
  "location": { "lat": "number", "lng": "number" },
  "evidence_url": "string | null",
  "escalation_sent": "boolean",
  "history": [{ "status": "string", "changed_by": "string", "note": "string", "timestamp": "date" }],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### users collection
```json
{
  "email": "string (unique)",
  "password_hash": "string (bcrypt)",
  "name": "string",
  "role": "user | admin",
  "language_pref": "english | hinglish | hindi",
  "createdAt": "date"
}
```

### entities collection
```json
{
  "type": "phone | upi_id | url | email | bank_account",
  "value": "string",
  "complaint_refs": ["ref_no"],
  "count": "number",
  "first_seen": "date",
  "last_seen": "date"
}
```

### fraud_patterns collection
```json
{
  "pattern_id": "PAT-XXXXXXXX",
  "entity_type": "string",
  "entity_value": "string",
  "complaint_count": "number",
  "severity": "CRITICAL | HIGH | MEDIUM",
  "status": "ACTIVE | RESOLVED",
  "complaints": ["ref_no"],
  "createdAt": "date"
}
```

### scam_alerts collection
```json
{
  "title": "string (max 100)",
  "description": "string (max 300)",
  "severity": "Critical | High | Medium",
  "affected_cities": ["string"],
  "scam_type": "string",
  "is_active": "boolean",
  "created_by": "string",
  "published_at": "date | null"
}
```

### knowledge_articles collection
```json
{
  "slug": "string (unique, url-safe)",
  "title": "string",
  "category": "phishing | upi_fraud | social_media | banking | identity_theft | general",
  "content_markdown": "string",
  "tags": ["string"],
  "views": "number",
  "published_at": "date"
}
```

---

## Default Categories (27 total)

Cyber: Cybercrime/Hacking · Fraud/Deception · Identity Theft · Extortion/Blackmail · Stalking · Harassment
Physical: Homicide · Attempted Murder · Aggravated Assault · Simple Assault · Sexual Assault · Domestic Violence · Kidnapping · Robbery
Property: Burglary · Larceny/Theft · Motor Vehicle Theft · Arson · Vandalism/Property Damage · Trespassing · Embezzlement
Other: Drug Trafficking · Drug Possession · Weapons Offenses · Traffic/DUI · Hit and Run · Disorderly Conduct

---

## API Routes (15 Endpoints)

### Public
```
POST  /api/complaints/classify    ML pipeline → FIR → emails → response
GET   /api/complaints/:ref_no     Case status + history (no auth)
GET   /api/alerts/active          Active scam alerts (max 3)
GET   /api/articles               Article list with pagination
GET   /api/articles/:slug         Article detail + view increment
GET   /api/heatmap                [{lat,lng,count}] for globe/leaflet
POST  /api/chat                   CyberBot conversation (Gemini API — gemini-1.5-flash)
POST  /api/admin/login            Returns JWT token
```

### Admin (JWT Required)
```
GET   /api/dashboard              All complaints + stats + patterns
POST  /api/complaints/update      Status update + officer assign
GET   /api/analytics              Aggregated chart data + trend%
POST  /api/alerts                 Create scam alert
PATCH /api/alerts/:id/toggle      Publish/unpublish alert
POST  /api/articles               Create article
POST  /api/articles/generate      Gemini AI article draft
```

---

## ML Pipeline (8 Steps)

```
1. Validate: text, email, name required
2. Sanitize: trim, strip scripts, limit 2000 chars
3. franc detects language → hindi / hinglish / english
4. Google Translate if not English
5. HuggingFace Zephyr 7B → {categories[], severity}
   - Retry on 503 (model loading) after 20s, max 2 retries
   - JSON parse → regex fallback → keyword fallback
6. getBnsSections(categories) from static JS dict
7. getDepartment(categories) from static JS dict
8. nanoid(8).toUpperCase() → ref_no = "FIR-XXXXXXXX"
9. MongoDB save + async emails + async entity extraction
10. Return response immediately
```

---

## 27 Crime Categories with Department Routing

```
Cybercrime/Hacking      → Cyber Crime Cell
Identity Theft          → Cyber Crime Cell
Fraud/Deception         → Economic Offences Wing
Embezzlement            → Economic Offences Wing
Drug Trafficking        → Narcotics Control Bureau
Drug Possession         → Narcotics Control Bureau
Homicide                → Criminal Investigation Department
Attempted Murder        → Criminal Investigation Department
Kidnapping              → Criminal Investigation Department
Sexual Assault          → Women Safety Wing
Domestic Violence       → Women Safety Wing
Stalking                → Women Safety Wing
Weapons Offenses        → Special Weapons Task Force
Traffic/DUI             → Traffic Police
Hit and Run             → Traffic Police
All others              → Cyber Crime Cell
```

---

## Knowledge Hub — Article Categories

```
LEGAL         → teal badge      BNS sections, legal references
SOP           → violet badge    Investigation procedures
THREAT BULLETIN → amber badge   Active threat alerts
GUIDE         → blue badge      User guides, tutorials
GENERAL       → gray badge      General cybersecurity
```

---

## BNS 2024 Key Mappings (for Legal Mapping panel on Case Detail)

```
Cybercrime/Hacking    → IT Act §66 · IT Act §43 · BNS §111
Fraud/Deception       → BNS §318 · BNS §318(4)
Identity Theft        → IT Act §66C · BNS §319
Extortion/Blackmail   → BNS §308 · BNS §309
Stalking              → BNS §78
Harassment            → BNS §351 · BNS §352
Domestic Violence     → BNS §85 · DV Act 2005
Sexual Assault        → BNS §64 · BNS §74
Robbery               → BNS §309 · BNS §296
Kidnapping            → BNS §137 · BNS §140
Homicide              → BNS §101 · BNS §105
```

---

## Spline 3D Model — Integration Steps

```
1. npm install @splinetool/react-spline @splinetool/runtime
2. Open Spline editor → Export → Code → React → copy prod.spline.design URL
3. Create: client/src/components/shared/SplineHero.tsx
4. Lazy load with React.Suspense (Spline is 2-8MB)
5. Cover watermark: position:absolute div, bottom-right, bg matches page bg
6. vite.config.ts: manualChunks: { spline: ['@splinetool/react-spline'] }
7. Use in Landing page: right half of hero, hidden on mobile (lg:block)
8. Fallback: CSS 3D shield spinner shown during load
```

---

## Globe Setup — globe.gl

```javascript
// Used on: Landing page (stats section) + /heatmap page
import Globe from 'globe.gl';

// Config
backgroundColor="rgba(10,15,30,1)"
atmosphereColor="#00D4FF"
atmosphereAltitude={0.15}
autoRotate={true}
autoRotateSpeed={0.8}

// City points (from heatmap API data)
pointsData={cities}
pointColor={() => '#00D4FF'}
pointAltitude={0.01}
pointRadius={0.5}

// Threat arcs
arcsData={arcs}
arcColor={arc => arc.severity === 'Critical' ? '#EF4444' : arc.severity === 'High' ? '#F59E0B' : '#22C55E'}
arcDashLength={0.4}
arcDashGap={0.2}
arcDashAnimateTime={2000}

// Indian cities hardcoded for heatmap
const CITY_COORDS = {
  Hyderabad:  [17.385,  78.4867],
  Mumbai:     [19.076,  72.8777],
  Delhi:      [28.7041, 77.1025],
  Bengaluru:  [12.9716, 77.5946],
  Chennai:    [13.0827, 80.2707],
  Kolkata:    [22.5726, 88.3639],
  Pune:       [18.5204, 73.8567],
  Ahmedabad:  [23.0225, 72.5714],
  Jaipur:     [26.9124, 75.7873],
  Lucknow:    [26.8467, 80.9462],
}
```

---

## Case Detail Page — Subject Risk Score Logic

```javascript
// Risk score displayed on suspect cards (from fraud pattern data)
// Score 80-100: red badge    "Risk: 94"
// Score 50-79:  amber badge  "Risk: 62"
// Score 0-49:   green badge  "Risk: 31"

// Risk score calculation (client-side display only)
function getRiskScore(entity) {
  const base = entity.count * 12;          // complaints linked
  const recency = isRecent(entity.last_seen) ? 20 : 0;
  return Math.min(99, base + recency);
}
```

---

## Evidence Timeline — Entry Types

```typescript
type TimelineEntryType =
  | 'ai_pattern'      // Brain icon, cyan — AI fraud pattern matched
  | 'call_logs'       // Phone icon — call logs uploaded
  | 'bank_statement'  // FileText icon — bank statement verified
  | 'evidence_upload' // Upload icon — files uploaded
  | 'status_change'   // RefreshCw icon — case status updated
  | 'assignment'      // User icon — officer assigned

// Populated from complaint.history[] array
// Each history entry maps to a timeline entry
```

---

## Component Library

### SeverityBadge
```tsx
// Shows BOTH color AND text always
const colors = {
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  High:     'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Medium:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Low:      'bg-green-500/15 text-green-400 border-green-500/30',
}
```

### StatusBadge
```tsx
const colors = {
  RECEIVED:            'bg-slate-500/15 text-slate-400',
  ASSIGNED:            'bg-blue-500/15 text-blue-400',
  UNDER_INVESTIGATION: 'bg-amber-500/15 text-amber-400',
  RESOLVED:            'bg-green-500/15 text-green-400',
}
// UNDER_INVESTIGATION includes a pulsing dot indicator
```

### CategoryPill (article categories)
```tsx
const colors = {
  LEGAL:            'bg-teal-500/15 text-teal-400 border-teal-500/30',
  SOP:              'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'THREAT BULLETIN':'bg-amber-500/15 text-amber-400 border-amber-500/30',
  GUIDE:            'bg-blue-500/15 text-blue-400 border-blue-500/30',
  GENERAL:          'bg-slate-500/15 text-slate-400 border-slate-500/30',
}
```

### RiskScoreBadge (suspect cards on Case Detail)
```tsx
const color = score >= 80 ? 'text-red-400' : score >= 50 ? 'text-amber-400' : 'text-green-400';
// Displays: "Risk: 94" with colored bar below name
```

### BNSSectionPill
```tsx
className="bg-violet-500/15 text-violet-300 border border-violet-500/30 rounded-full px-3 py-1 text-xs"
```

### LinkedCaseBadge (AI Intelligence panel)
```tsx
// Shows ref_no + match percentage
// >= 80% match: green badge
// 50-79% match: amber badge
// < 50% match:  gray badge
```

---

## Environment Variables

### server/.env
```
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=min_32_char_random_string
ADMIN_PASSWORD=your_admin_password
CLIENT_URL=http://localhost:5173
HF_API_TOKEN=hf_xxxx
HF_MODEL_ID=HuggingFaceH4/zephyr-7b-beta
GMAIL_USER=your@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=your_personal@gmail.com
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

### client/.env
```
VITE_API_URL=http://localhost:5000
```

---

## Coding Rules — Never Break These

```
1. ESModules (import/export) — NEVER require()
2. async/await — NEVER callbacks
3. Never expose victim_email in public API responses
4. Admin sidebar ALWAYS dark (#0F172A) regardless of theme
5. All API calls go through client/src/lib/api.ts only
6. All colors from brandguidelines.md — never invent new hex values
7. Severity badges ALWAYS show both color AND text label
8. Lucide React ONLY for icons — no emoji, no other icon lib
9. Admin JWT: Authorization: Bearer <token> header
10. Spline lazy-loaded in Suspense — never blocks page render
11. Globe lazy-loaded — import dynamically
12. TypeScript interfaces required for all props and API responses
13. All form inputs must have validation — never trust raw user input
14. node-cron escalation: only fires for Critical/High + RECEIVED + 30min+ old
15. Use nanoid(8) for ref_no — NEVER uuid
```

---

## Features for MVP

- Landing with Spline 3D model + globe + digital rain + hacker terminal
- Dark/Light theme toggle (persistent in localStorage)
- Citizen login/signup
- 3-step complaint wizard with language detection + evidence upload
- AI scanning animation during submission
- FIR result page
- Live case tracker (auto-poll 30s)
- My complaints list
- Admin login + SOC dashboard
- Case Investigation Detail (3-column layout from Stitch)
- Analytics with 4 Recharts charts
- 3D globe heatmap + Leaflet flat map toggle
- Fraud network graph
- Scam alerts management + homepage banner
- Knowledge Hub (Stitch-inspired layout with category tabs + trending sidebar)
- Admin article manager with AI generation
- CyberBot floating chatbot
- Emergency Response fixed button (admin)
- Global page shield loader
- Auto-escalation cron (node-cron, every 5 min)
- Fraud pattern detection (async, regex-based)

## Features Excluded from MVP

- Real police system integration (CCTNS)
- Actual OCR on evidence (scan animation is UI only)
- Voice input (Whisper API)
- Mobile app (React Native)
- WebSocket real-time (use polling)
- Multi-currency or multi-country support
- Fine-tuned ML models (Zephyr 7B zero-shot only)
- DBSCAN clustering (regex-based pattern detection only)

---

## Summary

CyberShield = Two experiences in one platform.

**Citizen Portal**: Accessible, multilingual, stress-free complaint filing.
Clean UI, Spline 3D hero, guided wizard, instant FIR delivery.

**Admin SOC**: CrowdStrike/Splunk-level intelligence interface.
Dark navy, cyan accents, 3D globe threat map, fraud network graph,
Case Investigation with suspect cards + evidence timeline + AI Intelligence panel,
Knowledge Hub with legal resources + SOPs + threat bulletins.

Both modes in dark (#0A0F1E default) and light (#F8FAFC) with smooth toggle.
Admin sidebar always stays dark regardless of mode.
Every element should feel production-grade, not like a student project.
