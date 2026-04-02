# CyberShield — Antigravity Agent Skills & Workflow
# How to run agents, which skills to assign, and in what order.

## Context files to create in workspace root (create ALL before any agent)
1. gemini.md          → master project context (read by every agent first)
2. brandguidelines.md → UI/UX rules (read by frontend agent)
3. api-contract.md    → all 15 routes (read by both agents)
4. backend.md         → backend build instructions (read by backend agent)
5. ml-integration.md  → ML pipeline (read by backend agent)
6. frontend-agent.md  → frontend build instructions (read by frontend agent)

## Agent settings (set once, never change)
Settings → Agent:
  Review policy: Always proceed
  Terminal command auto-execution: Always proceed
  Browser test auto-execution: Always proceed
Reason: Every confirmation pop-up wastes tokens.

## Model assignment (critical for quality + rate limit)
Backend agent:    Use Claude (claude-3-5-sonnet or claude-3-opus)
Frontend agent:   Use Gemini 2.5 Pro (best for visual/UI generation)
Debug/Fix agent:  Use Gemini 2.5 Flash (fastest, cheapest)

## Agent 1 — Backend agent
Name: "CyberShield Backend"
Model: Claude
First message:
  "Read gemini.md, backend.md, ml-integration.md, and api-contract.md completely.
   The server/ folder contains starter code — read each file before modifying.
   Task: Ensure all 15 API routes are working and tested.
   Start with: verify server.js starts correctly, MongoDB connects, and
   POST /api/complaints/classify returns a valid response for this test input:
   { text: 'Sir mera bank account hack ho gaya', email: 'test@test.com', name: 'Test' }
   Fix any issues found. Report which routes are working and which need attention."

Skills to enable:
  - Terminal execution (npm install, node, curl)
  - File read/write
  - Browser testing (for API testing)

## Agent 2 — Frontend agent
Name: "CyberShield Frontend"
Model: Gemini 2.5 Pro
First message:
  "Read gemini.md, brandguidelines.md, api-contract.md, and frontend-agent.md completely.
   The backend is running at http://localhost:5000.
   Task: Set up the React + Vite + TypeScript frontend in client/ folder.
   Start with:
   1. Run setup commands from frontend-agent.md
   2. Configure Tailwind with CyberShield theme from brandguidelines.md
   3. Create App.tsx with all routes from frontend-agent.md
   4. Create client/src/lib/api.ts with all API calls from api-contract.md
   5. Create client/src/types/index.ts with all TypeScript interfaces
   6. Build the Landing page (/) only — make it match brandguidelines.md exactly
   Report when the Landing page is visible at http://localhost:5173"

Skills to enable:
  - Terminal execution
  - File read/write
  - Browser testing (visual verification)

## Running agents in parallel — exact steps
1. Open Antigravity workspace
2. Click "Start conversation" (Agent 1 — Backend) — paste backend agent message
3. Wait 2 minutes for backend agent to start running
4. Click "Start conversation" again (Agent 2 — Frontend) — paste frontend agent message
5. Both agents now run simultaneously
6. DO NOT start a 3rd agent while both are running
7. Monitor both — use undo if either makes a destructive mistake

## Rate limit protection rules
- Max 2 agents at any time (never 3+)
- Each agent gets ONE clear task — not "build everything"
- When an agent finishes, stop it before starting the next task
- Use Gemini 2.5 Flash for small fixes (not Gemini Pro or Claude — cheaper)
- Never paste long prompts in chat — reference the .md files instead
- One session per day maximum (let rate limit reset overnight if needed)

## Prompting each agent correctly (short prompts only)

GOOD prompts (reference .md files):
  "Read frontend-agent.md. Build the /complaint page."
  "Read api-contract.md. Build the /api/analytics route."
  "Build the AdminDashboard page matching brandguidelines.md."

BAD prompts (waste tokens):
  "Build the complaint page with a dark background of #0A0F1E and cyan accent #00D4FF
   and make the textarea have a language detection badge and..." (put this in .md files)

## Build order for agents

### Backend agent session 1 (2-3 hours)
1. Verify server.js + MongoDB connection
2. Build all Mongoose models (models/index.js)
3. Build classify route (POST /api/complaints/classify)
4. Build status route (GET /api/complaints/:ref_no)
5. Test both with curl

### Frontend agent session 1 (parallel with backend session 1)
1. Setup React + Vite + Tailwind
2. Create App.tsx with all routes
3. Create api.ts and types/index.ts
4. Build Landing page (/)
5. Build Login page

### Backend agent session 2
1. Build analytics, heatmap, alerts routes
2. Build articles routes + Claude generation
3. Build chat route (CyberBot)
4. Build admin login + JWT

### Frontend agent session 2 (parallel)
1. Build /complaint 3-step wizard
2. Build /result FIR display
3. Build /track/:ref_no live tracker
4. Build global components: Navbar, AlertBanner, CyberBot

### Frontend agent session 3 (frontend only, 2 agents)
Agent A: Build admin pages (/admin, /admin/cases, /admin/case/:ref)
Agent B: Build intelligence pages (/analytics, /heatmap, /fraud-network)

### Final session (1 agent, Gemini Flash)
1. Wire all pages to real API (replace any mock data)
2. Fix responsive layout on mobile
3. Deploy: Vercel frontend + Render backend

## How to fix bugs without wasting tokens
1. First: try undo button (reverts to last good state)
2. Second: describe the specific problem: "The /complaint page shows a blank screen.
   The console error is: Cannot read properties of undefined (reading 'categories').
   The issue is in Result.tsx line 34 — location.state might be null."
3. Third: fix manually in Cursor if it's a small bug (don't burn agent tokens on 5-line fixes)
4. Never: keep prompting the agent to "try again" without specific guidance

## Testing checklist (run after each session)
After backend session 1:
  □ curl http://localhost:5000/health → { status: 'ok' }
  □ POST /api/complaints/classify with Hinglish text → returns ref_no
  □ GET /api/complaints/:ref_no → returns case data
  □ Check inbox for 2 emails

After frontend session 1:
  □ http://localhost:5173 shows Landing page
  □ Dark background #0A0F1E visible
  □ Cyan accent visible on buttons
  □ No TypeScript errors in console

After frontend session 2:
  □ /complaint form completes 3 steps
  □ Submit calls backend, shows loading animation
  □ /result page shows FIR data
  □ /track/:ref_no polls and shows timeline

After final session:
  □ Full end-to-end: type Hinglish → submit → email received → track status
  □ Admin login works
  □ Dashboard shows data
  □ Deployed URL working
