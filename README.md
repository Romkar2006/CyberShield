<p align="center">
  <img src="client/public/logo.png" alt="CyberShield Logo" width="120" />
</p>

<h1 align="center">🛡️ CyberShield — National Cyber Intelligence Platform</h1>

<p align="center">
  <strong>AI-Powered Cybercrime Classification · Automated FIR Generation · BNS 2024 Compliant</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Gemini%20%2B%20Zephyr%207B-8E44AD" />
  <img src="https://img.shields.io/badge/Law-BNS%202024-DC3545" />
  <img src="https://img.shields.io/badge/PWA-Installable-FF6F00?logo=pwa&logoColor=white" />
</p>

---

## 📌 About

**CyberShield** is a full-stack national intelligence platform that modernises cybercrime reporting in India. It combines Retrieval-Augmented Generation (RAG), vector databases, and real-time language translation to classify complaints, auto-generate First Information Reports (FIRs), and route cases to the correct law-enforcement departments — all within seconds.

Built for both **citizens** filing complaints and **officers** managing investigations, CyberShield delivers a dark-mode, mobile-first experience inspired by national defence command centres.

---

## ⚡ Core Features

### 🧠 AI Classification Engine
| Capability | Detail |
|---|---|
| **Crime Classification** | 27 crime categories powered by FAISS vector search + Zephyr-7B LLM |
| **Severity Assessment** | AI-assigned priority levels — Critical, High, Medium, Low |
| **Multilingual Support** | Accepts **Hinglish**, **Hindi (Devanagari)**, and **English** — auto-translates before classification |
| **BNS 2024 Mapping** | Every classification links to sections under the new Bharatiya Nyaya Sanhita and IT Act 2000 |
| **Confidence Scoring** | FAISS distance-based confidence percentage shown per classification |

### 📑 Automated FIR Generation
- Generates a **print-ready, professional FIR document** with applicable BNS/IPC sections, department routing, severity bar, and emergency helplines.
- **Dual email delivery** — victim receives both a formal acknowledgement and the full FIR dossier.
- **Escalation system** — Critical/High cases trigger automatic supervisor alerts after 30 minutes if unacknowledged.

### 🕵️ Officer Mission Control (Admin Dashboard)
- **Case Management** — View, filter, and update case status (Received → Assigned → Under Investigation → Resolved).
- **SOC Analytics** — Real-time charts for crime distribution, severity breakdown, and departmental workload.
- **Knowledge Hub** — AI-assisted article creation and editing for internal intelligence briefs.
- **Case Control Panel** — Complete FIR lifecycle management with officer assignment.

### 📱 Citizen Interface
- **File Complaint** — Step-by-step complaint filing with real-time AI classification feedback.
- **Track My Case** — Citizens can track their FIR status using their reference number.
- **AI Chat Assistant** — Gemini-powered 24/7 chatbot to guide victims through the process.
- **PWA Support** — Installable on any device for offline-capable, one-tap access.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CITIZEN / OFFICER                     │
│              (React 18 + Vite + Tailwind)               │
│                     PWA Installable                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  EXPRESS API SERVER                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Auth/JWT │ │ Classify │ │  Chat    │ │ FIR/Email  │ │
│  │  Routes  │ │  Routes  │ │ (Gemini) │ │  Generator │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│       │              │            │            │         │
│       ▼              ▼            ▼            ▼         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (Cloud)                │   │
│  │   Users · Complaints · Articles · Cases           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    ▼                  ▼                  ▼
┌────────┐      ┌───────────┐      ┌──────────┐
│ Gemini │      │HuggingFace│      │ Kaggle   │
│  API   │      │   API     │      │ Notebook │
│ (Chat) │      │(Classify) │      │(Research)│
└────────┘      └───────────┘      └──────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, Mongoose, JWT(Json Web Token), Nodemailer |
| **Database** | MongoDB Atlas (M0 Free Tier) |
| **AI / ML** | Google Gemini API, HuggingFace Inference API, Zephyr-7B-Beta, FAISS, Sentence-Transformers |
| **ML Research** | Kaggle Notebook (GPU T4), PyTorch, BitsAndBytes 4-bit quantization |
| **DevOps** | Vercel (Frontend), Render (Backend), GitHub Actions |
| **PWA** | vite-plugin-pwa, Service Workers, Web App Manifest |

---

## 📂 Project Structure

```
CyberShield/
├── client/                    # React frontend application
│   ├── public/                # Static assets, PWA manifest, logos
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── admin/         # Officer dashboard components
│       │   └── shared/        # Shared components (modals, readers)
│       ├── pages/             # Route-level page components
│       ├── lib/               # API client, utilities
│       └── App.tsx            # Root application with routing
│
├── server/                    # Express backend API
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route handlers
│   ├── middleware/            # Auth, rate limiting
│   ├── server.js              # Entry point with CORS config
│   └── .env.example           # Environment variable template
│
├── notebooks/                 # ML research & experiments
│   └── cybershield-ml.ipynb   # Full RAG + classification pipeline
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB Atlas** account ([free tier](https://mongodb.com/atlas))
- **API Keys**: [Google Gemini](https://aistudio.google.com/), [HuggingFace](https://huggingface.co/settings/tokens)

### 1. Clone
```bash
git clone https://github.com/Romkar2006/CyberShield.git
cd CyberShield
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your real credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

Open **http://localhost:5173** — you're live.

---

## 🔐 Environment Variables

Create a `server/.env` file using `server/.env.example` as a template:

| Variable | Purpose |
|:---|:---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `GEMINI_API_KEY` | Google Gemini API key for AI chat |
| `HF_API_TOKEN` | HuggingFace token for classification model |
| `ADMIN_EMAIL` | Admin account email for initial setup |
| `ADMIN_PASSWORD` | Admin account password |
| `GMAIL_USER` | Gmail address for sending FIR emails |
| `GMAIL_PASS` | Gmail App Password (not your login password) |

---

## 🌐 Deployment

| Service | Role | Config |
|:---|:---|:---|
| **Vercel** | Frontend hosting | Root Directory: `client` |
| **Render** | Backend hosting | Root Directory: `server`, Start: `node server.js` |
| **MongoDB Atlas** | Database | Allow `0.0.0.0/0` for network access |

Set `VITE_API_URL` in Vercel's environment variables to point to your Render backend URL.

---

## 🔬 ML Pipeline (Kaggle Notebook)

The classification engine was researched and prototyped in [`notebooks/cybershield-ml.ipynb`](notebooks/cybershield-ml.ipynb), which includes:

1. **156-example knowledge base** across 27 crime categories
2. **FAISS vector index** using `all-MiniLM-L6-v2` embeddings
3. **Zephyr-7B-Beta** with 4-bit quantization for on-device inference
4. **Hinglish → English** translation via Google Translate API
5. **BNS 2024 + IPC section mapping** for legal compliance
6. **Automated email pipeline** with HTML FIR dossier generation
7. **Escalation system** for unacknowledged Critical/High cases

---

## 📊 Crime Categories Supported

```
Homicide · Attempted Murder · Aggravated Assault · Simple Assault
Kidnapping · Sexual Assault · Domestic Violence · Burglary
Larceny/Theft · Motor Vehicle Theft · Arson · Vandalism
Trespassing · Fraud/Deception · Cybercrime/Hacking · Identity Theft
Extortion/Blackmail · Embezzlement · Drug Trafficking · Drug Possession
Weapons Offenses · Disorderly Conduct · Traffic/DUI · Hit and Run
Stalking · Harassment · Robbery
```

---

## ⚖️ Legal Framework

CyberShield maps every classification to the applicable sections of law:

- **Bharatiya Nyaya Sanhita (BNS) 2024** — India's new criminal code replacing the IPC
- **IT Act 2000** — Sections 43, 66, 66C for cyber offences
- **NDPS Act** — Drug-related offences
- **Arms Act** — Weapons offences
- **Motor Vehicles Act 1988** — Traffic and DUI offences
- **Protection of Women from Domestic Violence Act 2005**

---

## 🤝 Contributing

This is currently a solo project built for academic research and portfolio demonstration. Contributions, suggestions, and feedback are welcome — feel free to open an issue or pull request.

---

## 📜 License

This project is developed for **educational and research purposes** as part of a cybercrime intelligence simulation. All complaint data is synthetic and does not represent real incidents.

---

<p align="center">
  <strong>Developed with ❤️ for a Safer Digital India</strong>
</p>
