# CyberShield — Brand & UI Guidelines
# Every UI component must follow these rules exactly.
# Read this file before writing any frontend code or styles.
# This file works with the frontend-design Claude Code plugin.

---

## Design Identity

CyberShield looks like **CrowdStrike Falcon** meets **Splunk SIEM** — a professional
cybersecurity intelligence platform used by government officers and crime victims.

It must feel: futuristic · trustworthy · serious · immersive
It must NOT feel: like a student project · generic SaaS · startup landing page

Supports **Dark Mode** (default) and **Light Mode** (optional toggle).
Dark mode is the primary experience — the platform was designed dark-first.
Light mode is a clean professional alternative — NOT a white version of dark mode.
Light mode uses navy + cyan accents on white surfaces, not inverted dark colors.

---

## Color Palette — Dark Mode (Default)

### Backgrounds
```
--bg-primary:    #0A0F1E   ← page root
--bg-surface:    #0D1526   ← cards, panels, sidebars, forms
--bg-elevated:   #1E293B   ← table rows, input fields, hover states
--bg-overlay:    #0F172A   ← modals, dropdowns, tooltips
```

### Accent Colors (same in both modes)
```
--cyan:              #00D4FF   ← PRIMARY — buttons, active borders, links, CTAs
--violet:            #7C3AED   ← SECONDARY — AI elements, CyberBot, ML badges
--cyan-glow:         rgba(0, 212, 255, 0.15)
--cyan-glow-strong:  rgba(0, 212, 255, 0.30)
--violet-glow:       rgba(124, 58, 237, 0.40)
```

### Text — Dark Mode
```
--text-primary:   #E2E8F0
--text-secondary: #94A3B8
--text-muted:     #64748B
--text-inverse:   #0A0F1E   ← text ON cyan buttons
```

### Borders — Dark Mode
```
--border-default: rgba(255, 255, 255, 0.08)
--border-active:  #00D4FF
--border-danger:  rgba(239, 68, 68, 0.40)
--border-success: rgba(34, 197, 94, 0.40)
--border-warning: rgba(245, 158, 11, 0.40)
```

---

## Color Palette — Light Mode

Light mode is NOT an inversion of dark mode.
It is a clean professional look: white/light gray surfaces + navy text + cyan accents.
Think: government portal meets modern SaaS.

### Backgrounds — Light Mode
```
--bg-primary:    #F8FAFC   ← page root (very light gray-white, not pure white)
--bg-surface:    #FFFFFF   ← cards, panels, forms
--bg-elevated:   #F1F5F9   ← table rows alternate, input fields, hover states
--bg-overlay:    #FFFFFF   ← modals, dropdowns
--bg-sidebar:    #0F172A   ← admin sidebar STAYS DARK in light mode (intentional)
--bg-navbar:     #FFFFFF   ← light navbar with bottom border
```

### Accent Colors — Light Mode (same as dark)
```
--cyan:   #0099BB   ← slightly darker cyan for contrast on white
--violet: #6D28D9   ← slightly darker violet for contrast on white
```

### Text — Light Mode
```
--text-primary:   #0F172A   ← deep navy (not pure black)
--text-secondary: #475569   ← medium slate
--text-muted:     #94A3B8   ← light slate
--text-inverse:   #FFFFFF   ← text ON cyan/dark buttons
```

### Borders — Light Mode
```
--border-default: rgba(0, 0, 0, 0.08)
--border-active:  #0099BB
--border-danger:  rgba(239, 68, 68, 0.40)
--border-success: rgba(34, 197, 94, 0.40)
--border-warning: rgba(245, 158, 11, 0.40)
```

---

## Severity Colors — Same in Both Modes
```
--critical:  #EF4444
--high:      #F59E0B
--medium:    #EAB308
--low:       #22C55E
```

---

## Typography

### Font
```
Primary:  Inter (import from Google Fonts)
Fallback: system-ui, -apple-system, sans-serif
Monospace: 'JetBrains Mono', 'Fira Code', monospace  ← for ref_no, code, terminal
```

### Scale
```
Hero heading:      48px  weight 700   tracking -1.5px   color #E2E8F0
Page title:        32px  weight 600   tracking -0.5px   color #E2E8F0
Section heading:   24px  weight 600   tracking 0        color #E2E8F0
Card title:        18px  weight 500   tracking 0        color #E2E8F0
Body text:         14px  weight 400   line-height 1.6   color #E2E8F0
Small / label:     12px  weight 400   letter-spacing 0.5px  color #94A3B8
Micro / badge:     11px  weight 500   uppercase  letter-spacing 1px
Reference numbers: 20px  weight 600   monospace  color #00D4FF
Terminal text:     14px  monospace    color #00D4FF
```

### Rules
- Never use font-weight 600 or 700 on body text — headings only
- Reference numbers (FIR-XXXXXXXX) always in monospace cyan
- Never ALL CAPS except micro badges and table column headers
- No italic text anywhere in the UI

---

## Component Specifications

### Cards
```css
/* Dark mode */
background:    #0D1526;
border:        0.5px solid rgba(255,255,255,0.08);
border-radius: 12px;
padding:       20px 24px;

/* Light mode */
background:    #FFFFFF;
border:        0.5px solid rgba(0,0,0,0.08);
border-radius: 12px;
padding:       20px 24px;
box-shadow:    0 1px 3px rgba(0,0,0,0.06);

/* Hover — both modes */
border-color:  rgba(0,212,255,0.30);  /* dark */
border-color:  rgba(0,153,187,0.40);  /* light */
box-shadow:    0 0 20px rgba(0,212,255,0.10);
transition:    all 0.2s ease;
```

### Stat Cards (admin dashboard)
```css
/* Dark mode */
background:    #0D1526;
border-left:   3px solid [accent color];
border-radius: 12px;
padding:       20px;

/* Light mode */
background:    #FFFFFF;
border-left:   3px solid [accent color];
border-radius: 12px;
padding:       20px;
box-shadow:    0 1px 4px rgba(0,0,0,0.08);

/* Number — both modes */
font-size:     36px; font-weight: 700;
dark:  color: #E2E8F0;
light: color: #0F172A;

/* Label — both modes */
font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
dark:  color: #64748B;
light: color: #94A3B8;
```

Stat card left border colors (both modes):
- Total     → `#00D4FF`
- Critical  → `#EF4444`
- High      → `#F59E0B`
- Resolved  → `#22C55E`

### Buttons

**Primary (filled):**
```css
/* Dark mode */
background: #00D4FF;  color: #0A0F1E;
hover: background: #00BBDD; box-shadow: 0 0 20px rgba(0,212,255,0.40);

/* Light mode */
background: #0099BB;  color: #FFFFFF;
hover: background: #007A99; box-shadow: 0 0 16px rgba(0,153,187,0.30);
```

**Secondary (outlined):**
```css
/* Dark mode */
background: transparent; border: 1px solid #00D4FF; color: #00D4FF;
hover: background: rgba(0,212,255,0.08);

/* Light mode */
background: transparent; border: 1px solid #0099BB; color: #0099BB;
hover: background: rgba(0,153,187,0.08);
```

**Ghost:**
```css
/* Dark mode */
color: #94A3B8; hover: color: #E2E8F0; background: rgba(255,255,255,0.05);

/* Light mode */
color: #64748B; hover: color: #0F172A; background: rgba(0,0,0,0.04);
```

**AI / Violet — same in both modes:**
```css
background: #7C3AED; color: white;
hover: box-shadow: 0 0 20px rgba(124,58,237,0.50);
```

### Input Fields & Textareas
```css
/* Dark mode */
background: #1E293B;  border: 1px solid rgba(255,255,255,0.08);
color: #E2E8F0;  placeholder: #64748B;
focus: border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.10);

/* Light mode */
background: #FFFFFF;  border: 1px solid rgba(0,0,0,0.12);
color: #0F172A;  placeholder: #94A3B8;
focus: border-color: #0099BB; box-shadow: 0 0 0 3px rgba(0,153,187,0.12);
```

### Navbar
```css
/* Dark mode */
background: rgba(10,15,30,0.95); border-bottom: 1px solid rgba(255,255,255,0.06);
backdrop-filter: blur(12px);

/* Light mode */
background: rgba(255,255,255,0.95); border-bottom: 1px solid rgba(0,0,0,0.08);
backdrop-filter: blur(12px);
box-shadow: 0 1px 3px rgba(0,0,0,0.06);
```

Both modes: height 64px, sticky top-0, z-index 100.

### Admin Sidebar
```css
/* INTENTIONALLY STAYS DARK IN BOTH MODES */
/* This is a deliberate design choice — the sidebar is always dark navy */
/* It creates visual separation and looks professional in both light and dark */
background: #0F172A;
border-right: 1px solid rgba(255,255,255,0.06);

/* Active nav item — both modes */
border-left: 3px solid #00D4FF;
background: rgba(0,212,255,0.08);
color: #00D4FF;
```

### Tables
```css
/* Header row */
dark:  background: #1E293B; color: #94A3B8;
light: background: #F1F5F9; color: #64748B;
font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
padding: 10px 16px;

/* Data rows */
dark  odd:  background: #0D1526;
dark  even: background: #0F1729;
light odd:  background: #FFFFFF;
light even: background: #F8FAFC;
border-bottom-dark:  1px solid rgba(255,255,255,0.04);
border-bottom-light: 1px solid rgba(0,0,0,0.05);
padding: 12px 16px;

/* Row hover */
dark:  background: rgba(0,212,255,0.04);
light: background: rgba(0,153,187,0.04);
```

---

## Badge / Pill Components

### Severity Badges
Always show BOTH color AND text. Never color-only.

```css
/* Base */
border-radius: 20px;
padding:       3px 10px;
font-size:     11px;
font-weight:   600;
letter-spacing: 0.5px;
text-transform: uppercase;

/* CRITICAL */
background:    rgba(239, 68, 68, 0.15);
color:         #EF4444;
border:        1px solid rgba(239, 68, 68, 0.30);

/* HIGH */
background:    rgba(245, 158, 11, 0.15);
color:         #F59E0B;
border:        1px solid rgba(245, 158, 11, 0.30);

/* MEDIUM */
background:    rgba(234, 179, 8, 0.15);
color:         #EAB308;
border:        1px solid rgba(234, 179, 8, 0.30);

/* LOW */
background:    rgba(34, 197, 94, 0.15);
color:         #22C55E;
border:        1px solid rgba(34, 197, 94, 0.30);
```

### Status Badges
```css
/* RECEIVED */
background:    rgba(100, 116, 139, 0.15);
color:         #94A3B8;
border:        1px solid rgba(100, 116, 139, 0.30);

/* ASSIGNED */
background:    rgba(59, 130, 246, 0.15);
color:         #60A5FA;
border:        1px solid rgba(59, 130, 246, 0.30);

/* UNDER_INVESTIGATION */
background:    rgba(245, 158, 11, 0.15);
color:         #F59E0B;
border:        1px solid rgba(245, 158, 11, 0.30);

/* RESOLVED */
background:    rgba(34, 197, 94, 0.15);
color:         #22C55E;
border:        1px solid rgba(34, 197, 94, 0.30);
```

### Language Detection Badges
```css
/* English detected */
background:    rgba(34, 197, 94, 0.15);
color:         #22C55E;
border:        1px solid rgba(34, 197, 94, 0.30);

/* Hinglish detected */
background:    rgba(245, 158, 11, 0.15);
color:         #F59E0B;
border:        1px solid rgba(245, 158, 11, 0.30);

/* Hindi detected */
background:    rgba(96, 165, 250, 0.15);
color:         #60A5FA;
border:        1px solid rgba(96, 165, 250, 0.30);
```

### BNS Section Pills (legal sections)
```css
background:    rgba(124, 58, 237, 0.15);
color:         #A78BFA;
border:        1px solid rgba(124, 58, 237, 0.30);
border-radius: 20px;
padding:       3px 10px;
font-size:     11px;
```

### Crime Category Pills
```css
background:    rgba(0, 212, 255, 0.10);
color:         #00D4FF;
border:        1px solid rgba(0, 212, 255, 0.25);
border-radius: 20px;
padding:       3px 10px;
font-size:     12px;
```

---

## Animation Specifications

### 1. Digital Rain (Login page background)
- HTML5 Canvas, full viewport behind login form
- Characters: katakana (ア-ン) + numbers (0-9) + binary (0,1) + hex (A-F)
- Head character: white #FFFFFF with cyan glow (shadowColor: #00D4FF, shadowBlur: 8)
- Trail characters: rgba(0,212,255, fading opacity) — 8 chars deep
- Font: 14px monospace
- Speed: 0.5–1.0 cells per frame (random per column)
- Background fade: rgba(10,15,30,0.05) per frame — creates trail effect
- On successful auth: fadeOut over 1.5s (opacity 1→0), then landing page fades in

### 2. Page Loader (Route transitions)
- CSS 3D rotating shield shape
- Color: #00D4FF outline on transparent/dark background
- Transform: rotateY(360deg), 3s infinite linear
- Scanning light: pseudo-element sweeping vertically across shield
  - background: linear-gradient(transparent, rgba(0,212,255,0.4), transparent)
  - animation: scan 2s ease-in-out infinite
- Shows during React Router route transitions
- Hidden when page content renders

### 3. AI Scanning Animation (Complaint submission)
5-step sequential progress during Zephyr 7B inference (10–15 seconds):

```
Step 1: "Detecting Language"      → 0.5s  → complete (green)
Step 2: "Translating to English"  → 1.0s  → complete (green)
Step 3: "AI Classifying..."       → 10-15s → active (cyan pulse)
Step 4: "Mapping BNS 2024"        → 0.5s  → complete (green)
Step 5: "Sending FIR to Email"    → 1.0s  → complete (green)
```

Active step style:
```css
border: 1px solid #00D4FF;
box-shadow: 0 0 12px rgba(0,212,255,0.30);
color: #00D4FF;
```

Neural network canvas during step 3:
- Small nodes (5px circles) connected by lines
- Nodes fire in sequence — amber glow (#F59E0B) propagates through network
- Canvas: 100% width, ~180px height

### 4. Investigation Timeline (Status tracker)
Horizontal stepper, 5 stages:

```
Stage 1: Complaint Submitted
Stage 2: AI Analysis Complete
Stage 3: Under Investigation
Stage 4: Assigned to Authority
Stage 5: Resolved
```

```css
/* Completed stage */
background: #22C55E;
border: 2px solid #22C55E;
/* Checkmark glyph inside */

/* Active stage — pulse animation */
background: #00D4FF;
border: 2px solid #00D4FF;
animation: pulse 1.5s ease-in-out infinite;
/* @keyframes pulse: box-shadow 0→12px rgba(0,212,255,0.5)→0 */

/* Upcoming stage */
background: transparent;
border: 2px solid #1E293B;
color: #64748B;

/* Connecting line */
completed portion: background #00D4FF;
upcoming portion:  background #1E293B;
```

### 5. CyberBot Robot (Floating FAB)
```css
position: fixed; bottom: 28px; right: 28px; z-index: 50;
width: 56px; height: 56px;
background: #7C3AED;
border-radius: 50%;
box-shadow: 0 0 20px rgba(124,58,237,0.40);

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-4px); }
}
animation: float 2s ease-in-out infinite;

/* Hover */
transform: scale(1.12);
box-shadow: 0 0 32px rgba(124,58,237,0.60);
transition: all 0.2s ease;
```

### 6. Hacker Terminal (Hero section)
```
Library:    typed.js
Font:       14px JetBrains Mono or Courier New
Color:      #00D4FF
Cursor:     blinking | character

Messages (loop):
  "> Monitoring cyber threats..."
  "> AI classification active..."
  "> Fraud patterns detected..."
  "> BNS 2024 sections mapped..."
  "> System online and ready..."

typeSpeed:  40ms
backSpeed:  20ms
backDelay:  1500ms
loop:       true
```

### 7. Scam Alert Banner
```css
/* Shown when GET /api/alerts/active returns results */
background:    rgba(239, 68, 68, 0.08);
border-bottom: 1px solid rgba(239, 68, 68, 0.25);
padding:       10px 24px;
width:         100%;

/* Pulsing dot */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
width: 8px; height: 8px; border-radius: 50%;
background: #EF4444;
animation: blink 1.2s ease-in-out infinite;
```

### 8. Count-Up Animation (Stat cards)
- On dashboard mount: numbers count up from 0 to value
- Duration: 1.2s ease-out
- Use requestAnimationFrame with easeOutQuart

---

## Chart Configuration (Recharts — dark theme)

```jsx
/* Apply to ALL charts */
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

<XAxis
  stroke="#64748B"
  tick={{ fill: '#94A3B8', fontSize: 12 }}
  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
/>

<YAxis
  stroke="#64748B"
  tick={{ fill: '#94A3B8', fontSize: 12 }}
  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
/>

<Tooltip
  contentStyle={{
    background: '#1E293B',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '8px',
    color: '#E2E8F0',
    fontSize: '13px'
  }}
/>

/* Bar fill */        fill="#00D4FF"
/* Line stroke */     stroke="#00D4FF" strokeWidth={2}
/* Area fill */       fill="rgba(0,212,255,0.10)" stroke="#00D4FF"

/* Severity pie colors */
Critical: "#EF4444"
High:     "#F59E0B"
Medium:   "#EAB308"
Low:      "#22C55E"

/* Multi-series colors */
Series 1: "#00D4FF"
Series 2: "#7C3AED"
Series 3: "#22C55E"
Series 4: "#F59E0B"
```

---

## Leaflet Map Configuration (Dark theme)

```jsx
/* Tile layer — CartoDB Dark Matter */
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
attribution="© OpenStreetMap contributors © CARTO"

/* India center */
center={[20.5937, 78.9629]}
zoom={5}

/* Heatmap gradient */
gradient={{ 0.4: '#3B82F6', 0.65: '#F59E0B', 1.0: '#EF4444' }}
radius={30}
blur={20}

/* Map container */
background: #0A0F1E;
border-radius: 12px;
```

---

## Globe Configuration (globe.gl)

```jsx
backgroundColor="rgba(10,15,30,1)"
atmosphereColor="#00D4FF"
atmosphereAltitude={0.15}
globeImageUrl=""  /* no image — use custom dark globe */

/* Arc colors by severity */
Critical arc: "#EF4444"  opacity 0.9
High arc:     "#F59E0B"  opacity 0.8
Resolved arc: "#22C55E"  opacity 0.7

/* City points */
color: "#00D4FF"
altitude: 0.01
radius: 0.5

/* Auto-rotate */
autoRotate: true
autoRotateSpeed: 0.8
```

---

## Spacing System

```
4px   → micro gaps (badge internal padding)
8px   → tight (icon-to-text gap, inline elements)
12px  → small (card gap, table cell gap)
16px  → base (component padding)
20px  → medium (section gaps)
24px  → card padding horizontal
32px  → section padding
48px  → page section spacing
64px  → hero section spacing
```

---

## Icon System

**Library: Lucide React ONLY — no emoji, no other icon libraries**

Key icon assignments:
```
Shield         → logo, security, CyberShield brand
FileText       → complaints, FIR documents
AlertTriangle  → warnings, scam alerts, critical cases
Network        → fraud network graph
Map            → heatmap
BarChart2      → analytics
Brain          → AI features, CyberBot, ML badge
Mail           → email sent, FIR delivery
Lock           → auth, security
User           → profile, citizen
Users          → admin, officer
Search         → search inputs
Bell           → notifications
Eye            → view case, track
CheckCircle    → resolved, completed
Clock          → pending, under investigation
Zap            → fast processing, AI speed
Globe          → globe heatmap, worldwide
```

---

## Layout Rules

### Page structure
```
<html background="#0A0F1E">
  <AlertBanner />        ← conditional, full width, above navbar
  <Navbar />             ← sticky, 64px height
  <main>
    <Outlet />           ← page content
  </main>
  <CyberBot />           ← fixed FAB, every page
</html>
```

### Admin layout
```
<div display="flex">
  <Sidebar width="220px" />
  <main flex="1">
    <AdminTopBar />
    <Outlet />
  </main>
</div>
```

### Content max-width
```
Max content width: 1280px
Page padding:      0 32px (desktop) / 0 16px (mobile)
Section gaps:      48px between major sections
Card grid gap:     16px
```

---

## Responsive Breakpoints

```
Mobile:  < 640px   → stack everything, hide sidebar, hamburger menu
Tablet:  640–1024px → simplified grid, collapsible sidebar
Desktop: > 1024px  → full layout as designed
```

---

## Do Not Do List — Strictly Forbidden

```
✗ Never use pure white (#FFFFFF) as page root in light mode — use #F8FAFC
✗ Never invert the dark mode colors to make light mode — design them separately
✗ Never make the admin sidebar light — it always stays dark (#0F172A)
✗ Never remove the theme toggle once added — always give users the choice
✗ Never use text gradients (gradient on text)
✗ Never use drop shadows in dark mode — use box-shadow glow only
✗ Never use harsh drop shadows in light mode — use soft rgba(0,0,0,0.06) only
✗ Never use border-radius > 16px on cards
✗ Never use font-weight 600 or 700 on body paragraphs
✗ Never use red color for anything except severity badges or error states
✗ Never show severity badge as color-only — always include the word too
✗ Never use emoji anywhere in the UI — Lucide React icons only
✗ Never use CSS animations on layout-affecting properties (width, height, margin)
✗ Never use glassmorphism / frosted glass effects
✗ Never use noise textures or mesh backgrounds
✗ Never center-align body text — left-align only
✗ Never use more than 3 colors on one chart
✗ Never show the Leaflet default blue tile background
✗ Never use a pure black (#000000) background in dark mode — use #0A0F1E
✗ Never flash between modes without a smooth transition (use transition: all 0.3s ease)
```

---

## Quick Reference — Copy-Paste Tailwind Classes

```
/* Backgrounds */
Page root:           bg-[#F8FAFC] dark:bg-[#0A0F1E]
Card surface:        bg-white dark:bg-[#0D1526]
Elevated surface:    bg-[#F1F5F9] dark:bg-[#1E293B]
Sidebar (always dk): bg-[#0F172A]

/* Text */
Primary text:        text-[#0F172A] dark:text-[#E2E8F0]
Secondary text:      text-[#475569] dark:text-[#94A3B8]
Muted text:          text-[#94A3B8] dark:text-[#64748B]

/* Accents */
Cyan text:           text-[#0099BB] dark:text-[#00D4FF]
Cyan border:         border-[#0099BB] dark:border-[#00D4FF]
Cyan bg (button):    bg-[#0099BB] dark:bg-[#00D4FF]
Violet accent:       text-[#6D28D9] dark:text-[#7C3AED]

/* Borders */
Default border:      border border-black/[0.08] dark:border-white/[0.08]
Active border:       border-[#0099BB] dark:border-[#00D4FF]

/* Effects */
Card glow hover:     hover:shadow-[0_0_16px_rgba(0,153,187,0.15)] dark:hover:shadow-[0_0_20px_rgba(0,212,255,0.10)]
Cyan glow strong:    shadow-[0_0_20px_rgba(0,212,255,0.40)]

/* Border radius */
Cards:               rounded-xl
Buttons + inputs:    rounded-lg
Badges + pills:      rounded-full
```

---

## Theme Toggle — Implementation

### How the toggle works
- Toggle button in Navbar (Sun/Moon icon from Lucide React)
- State stored in `localStorage` key: `cybershield-theme`
- Default: `dark`
- On change: add/remove class `dark` on `<html>` element
- Smooth transition: `transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease`

### Tailwind dark mode setup (tailwind.config.js)
```js
module.exports = {
  darkMode: 'class',  // ← class-based, not media query
  theme: { ... }
}
```

### ThemeProvider component (client/src/components/layout/ThemeProvider.tsx)
```tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark', toggle: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('cybershield-theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem('cybershield-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Navbar toggle button
```tsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const { theme, toggle } = useTheme();

<button onClick={toggle} className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
  {theme === 'dark'
    ? <Sun size={18} className="text-[#94A3B8] hover:text-[#00D4FF]" />
    : <Moon size={18} className="text-[#475569] hover:text-[#0099BB]" />
  }
</button>
```

### Tailwind class pattern — how to write dual-mode classes
```tsx
// Background
className="bg-[#F8FAFC] dark:bg-[#0A0F1E]"

// Card surface
className="bg-white dark:bg-[#0D1526]"

// Elevated surface
className="bg-[#F1F5F9] dark:bg-[#1E293B]"

// Primary text
className="text-[#0F172A] dark:text-[#E2E8F0]"

// Secondary text
className="text-[#475569] dark:text-[#94A3B8]"

// Muted text
className="text-[#94A3B8] dark:text-[#64748B]"

// Default border
className="border border-black/[0.08] dark:border-white/[0.08]"

// Card component (full)
className="bg-white dark:bg-[#0D1526] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-6 hover:border-[#0099BB]/40 dark:hover:border-[#00D4FF]/30 transition-all"

// Input field (full)
className="bg-white dark:bg-[#1E293B] border border-black/[0.12] dark:border-white/[0.08] text-[#0F172A] dark:text-[#E2E8F0] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:border-[#0099BB] dark:focus:border-[#00D4FF] focus:ring-2 focus:ring-[#0099BB]/10 dark:focus:ring-[#00D4FF]/10 rounded-lg px-3 py-2.5"

// Primary button (full)
className="bg-[#0099BB] dark:bg-[#00D4FF] text-white dark:text-[#0A0F1E] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#007A99] dark:hover:bg-[#00BBDD] hover:shadow-[0_0_16px_rgba(0,153,187,0.30)] dark:hover:shadow-[0_0_20px_rgba(0,212,255,0.40)] transition-all"

// Navbar
className="bg-white/95 dark:bg-[#0A0F1E]/95 border-b border-black/[0.08] dark:border-white/[0.06] backdrop-blur-md sticky top-0 z-50"

// Table header
className="bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] text-xs uppercase tracking-wider"

// Table row
className="bg-white dark:bg-[#0D1526] border-b border-black/[0.05] dark:border-white/[0.04] hover:bg-[#0099BB]/[0.04] dark:hover:bg-[#00D4FF]/[0.04]"
```

### CSS variables approach (globals.css) — alternative to Tailwind classes
```css
:root {
  --bg-primary:    #F8FAFC;
  --bg-surface:    #FFFFFF;
  --bg-elevated:   #F1F5F9;
  --text-primary:  #0F172A;
  --text-secondary:#475569;
  --text-muted:    #94A3B8;
  --border:        rgba(0,0,0,0.08);
  --cyan:          #0099BB;
  --violet:        #6D28D9;
}

.dark {
  --bg-primary:    #0A0F1E;
  --bg-surface:    #0D1526;
  --bg-elevated:   #1E293B;
  --text-primary:  #E2E8F0;
  --text-secondary:#94A3B8;
  --text-muted:    #64748B;
  --border:        rgba(255,255,255,0.08);
  --cyan:          #00D4FF;
  --violet:        #7C3AED;
}

/* Global smooth transition */
*, *::before, *::after {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
}
```

### Light mode visual notes
- Scam alert banner: `bg-red-50 border-red-200` (softer than dark mode)
- Digital rain: use darker cyan `#0099BB` so it shows on light background
- Card glow on hover: `box-shadow: 0 0 16px rgba(0,153,187,0.15)` (subtler)
- Admin sidebar: ALWAYS stays dark `#0F172A` regardless of mode — intentional contrast
- CyberBot FAB: same violet in both modes
- Charts: swap `#0A0F1E` tooltip bg with `#FFFFFF` in light mode
- Page loader shield: same cyan outline works on both backgrounds

---

CyberShield = **CrowdStrike Falcon + Splunk SIEM** visual language.
**Dark mode** (default): Deep space navy background. Electric cyan accents. Deep violet for AI.
**Light mode**: Clean white/gray surfaces. Navy text. Same cyan and violet accents. Softer glows.
Admin sidebar stays dark in both modes — intentional contrast.
Flat surfaces, thin borders, subtle glows on hover.
Every element should feel like it belongs in a government security operations center.
