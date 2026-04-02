# CyberShield — Frontend Build Instructions
# Read gemini.md and brandguidelines.md FIRST. Then this file.
# This agent builds ALL frontend pages and components.

## Setup commands (run these first, once)
```bash
cd client
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom framer-motion
npm install @radix-ui/react-dialog @radix-ui/react-select lucide-react
npm install recharts react-force-graph-2d globe.gl react-leaflet leaflet
npm install react-markdown typed.js
npm install class-variance-authority clsx tailwind-merge
```

## tailwind.config.js — extend with CyberShield theme
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary':   '#0A0F1E',
        'bg-surface':   '#0D1526',
        'bg-elevated':  '#1E293B',
        'accent-cyan':  '#00D4FF',
        'accent-violet':'#7C3AED',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

## index.css — global styles
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
body {
  background-color: #0A0F1E;
  color: #E2E8F0;
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
}
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0A0F1E; }
::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }
```

## App.tsx — all routes
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import HowItWorks from './pages/HowItWorks';
import Helplines from './pages/Helplines';
import Hub from './pages/Hub';
import Article from './pages/Article';
import StatusEntry from './pages/StatusEntry';

// Citizen pages
import Complaint from './pages/Complaint';
import Result from './pages/Result';
import Track from './pages/Track';
import MyComplaints from './pages/MyComplaints';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Admin pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCases from './pages/AdminCases';
import CaseDetail from './pages/CaseDetail';
import Analytics from './pages/Analytics';
import Heatmap from './pages/Heatmap';
import FraudNetwork from './pages/FraudNetwork';
import AdminAlerts from './pages/AdminAlerts';
import AdminArticles from './pages/AdminArticles';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="helplines" element={<Helplines />} />
          <Route path="hub" element={<Hub />} />
          <Route path="hub/:slug" element={<Article />} />
          <Route path="status" element={<StatusEntry />} />
          <Route path="complaint" element={<Complaint />} />
          <Route path="result" element={<Result />} />
          <Route path="track/:ref_no" element={<Track />} />
          <Route path="my-complaints" element={<MyComplaints />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="heatmap" element={<Heatmap />} />
          <Route path="fraud-network" element={<FraudNetwork />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/cases" element={<AdminCases />} />
        <Route path="/admin/case/:ref" element={<CaseDetail />} />
        <Route path="/admin/alerts" element={<AdminAlerts />} />
        <Route path="/admin/articles" element={<AdminArticles />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## components/layout/Layout.tsx
- Renders Navbar + AlertBanner + CyberBot + <Outlet />
- AlertBanner: on mount, calls getActiveAlerts() — shows red strip if results
- CyberBot: always visible floating FAB bottom-right
- Wrap in a div with bg-[#0A0F1E] min-h-screen

## components/layout/Navbar.tsx
- Logo: "CyberShield" with small shield SVG in cyan
- Links: Home, How it Works, Helplines, Knowledge Hub
- Right: notification bell with count badge, Login/avatar button
- Sticky top-0, backdrop-blur-md, border-b border-white/5
- Height 64px

## components/layout/AlertBanner.tsx
- Fetches GET /api/alerts/active on mount
- If alerts exist: full-width strip, bg-red-500/10, border border-red-500/30
- Shows: "ACTIVE ALERT: {alert.title}" with animated pulse dot
- Dismiss button (X) — sets dismissed in sessionStorage
- Z-index above navbar

## components/layout/CyberBot.tsx
- Fixed position: bottom: 28px, right: 28px
- Robot shape: SVG or CSS, violet color #7C3AED
- Float animation: keyframes up-down 3px, 2s infinite
- On click: opens chat panel (slide up from bottom-right)
- Chat panel: calls POST /api/chat with message and history
- Quick reply chips: "How to file FIR?", "Track my case", "Emergency helplines"

## pages/Landing.tsx — most important page
Sections in order:
1. Digital rain canvas (only on login → landing transition, fades after 2s)
2. Scam alert banner (from AlertBanner component)
3. Navbar
4. Hero: headline + hacker terminal + 2 CTAs + 3 trust badges
5. Stats row: 4 metric cards
6. How it works: 5-step pipeline
7. Emergency strip: 4 helpline pills
8. Footer

Hacker terminal implementation:
```tsx
import Typed from 'typed.js';
const el = useRef(null);
useEffect(() => {
  const typed = new Typed(el.current, {
    strings: [
      '> Monitoring cyber threats...',
      '> AI classification active...',
      '> Fraud patterns detected...',
      '> BNS 2024 sections mapped...',
      '> System online and ready...'
    ],
    typeSpeed: 40, backSpeed: 20, loop: true, backDelay: 1500
  });
  return () => typed.destroy();
}, []);
```

## pages/Complaint.tsx — 3-step wizard
State: step (1/2/3), text, language, name, email, city, evidenceUrl, isProcessing

Step 1:
- Large textarea for complaint text
- On text change: call detectLanguage locally (check Devanagari chars + Hinglish words)
- Show LangBadge component with detected language
- File upload zone: on file select, show scan animation
- "Next →" button

Step 2:
- Name input
- Email input
- City dropdown (10 Indian cities)
- Phone input (optional)
- "← Back" and "Next →" buttons

Step 3 (Review):
- Show complaint preview
- Show all filled details
- "Submit Complaint" button
- On submit: show ScanAnimation component (5-step progress)
- Call classifyComplaint() from api.ts
- On success: navigate to /result with response data in location.state

## pages/Result.tsx — FIR result display
Gets data from location.state (passed from /complaint)
Show:
- Green success banner: "FIR Filed — Reference: {ref_no}"
- ref_no in large monospace cyan
- Crime category badges (cyan pills)
- BNS section pills (violet pills)
- Severity badge (color-coded)
- Department assigned
- Victim guidance numbered list
- "Track my case →" link to /track/{ref_no}
- "Email confirmation sent" strip at bottom
- Related Knowledge Hub articles (based on first category)

## pages/Track.tsx — Live case tracker
Gets ref_no from URL params
- Calls getCaseStatus(ref_no) on mount
- Polls every 30 seconds using setInterval
- Shows AnimatedTimeline component with 5 stages
- Shows officer name + department
- Shows last updated timestamp

## components/shared/AnimatedTimeline.tsx — Investigation stepper
5 stages: Submitted → AI Analysis → Under Investigation → Assigned → Resolved
- Determine active stage from status prop
- Completed: filled green circle + checkmark
- Active: filled cyan circle + pulse animation (box-shadow: 0 0 0 0 rgba(0,212,255,0.4), keyframe pulse)
- Upcoming: outlined gray circle
- Connecting line: cyan for completed, gray for upcoming

## components/complaint/ScanAnimation.tsx
Shows during 10-15s Zephyr inference
- 5 step cards shown in sequence
- Each step: icon + label + status indicator
- Steps: "Detecting Language" → "Translating to English" → "AI Classifying..." → "Mapping BNS 2024" → "Sending FIR Email"
- NeuralNetworkCanvas: small canvas with firing nodes animation
- Auto-advances based on timer

## components/complaint/LangBadge.tsx
Props: language ('english' | 'hinglish' | 'hindi' | null)
Shows pill with detected language
Colors from brandguidelines.md language badge section

## pages/AdminDashboard.tsx — SOC dashboard
- 4 StatCard components at top
- Two-column layout: CasesTable (60%) + mini-chart+patterns (40%)
- Recharts BarChart for top categories
- FraudPatternCard for detected patterns
- ActiveAlertsTable at bottom
- All data from getDashboard() API call

## pages/Analytics.tsx — Charts dashboard
- 4 Recharts visualizations
- BarChart: top 10 categories (horizontal)
- LineChart: monthly trend (last 12 months)
- PieChart: severity distribution
- AreaChart: complaint growth over time
- Trend indicator: "+29% this month" in green/red based on value
- All data from getAnalytics() API call

## pages/Heatmap.tsx — Leaflet India map
```tsx
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fetch data from getHeatmapData()
// Convert to [[lat, lng, intensity]] format
// intensity = count / maxCount (normalize to 0-1)
// Add L.heatLayer(points, { radius: 25, blur: 15, gradient: { 0.4: 'blue', 0.65: 'orange', 1: 'red' } })
```

## pages/FraudNetwork.tsx — Force graph
```tsx
import ForceGraph2D from 'react-force-graph-2d';
// Nodes: entities (UPI IDs, phones) + complaints
// Edges: complaint → shared entity → complaint
// Node colors: cyan for entities, violet for complaints
// Click node: filter complaints table below
```

## TypeScript interfaces (client/src/types/index.ts)
```typescript
export interface ComplaintPayload {
  text: string;
  email: string;
  name: string;
  city?: string;
  evidence_url?: string;
}

export interface ClassifyResponse {
  ref_no: string;
  categories: string[];
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  department: string;
  bns_sections: string[];
  detected_language: 'hindi' | 'hinglish' | 'english';
  confidence: string;
  victim_guidance: string[];
  email_sent: boolean;
}

export interface CaseStatus {
  ref_no: string;
  categories: string[];
  severity: string;
  department: string;
  status: 'RECEIVED' | 'ASSIGNED' | 'UNDER_INVESTIGATION' | 'RESOLVED';
  assigned_officer: string;
  city: string;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  status: string;
  changed_by: string;
  note: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ScamAlert {
  _id: string;
  title: string;
  description: string;
  severity: string;
  affected_cities: string[];
  scam_type: string;
  published_at: string;
}
```

## Environment variables (client/.env)
```
VITE_API_URL=http://localhost:5000
```

For production: VITE_API_URL=https://your-app.onrender.com
