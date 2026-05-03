# VoteSmart AI 🗳️

> **Built for PromptWars Hackathon — Google for Developers | Powered by Claude AI**

VoteSmart AI is a complete, production-grade election assistant for Indian voters. It provides nonpartisan civic education, AI-powered fact-checking, candidate exploration, and guided voter registration — all in one app.

---

## Features

### Compulsory 5
1. **Registration Guide** — 4-step wizard with ECI process
2. **Candidate Explorer** — All major 2024 candidates with comparison
3. **Polling Booth Finder** — Map-based booth locator
4. **How to Vote Guide** — Step-by-step with EVM illustration
5. **Results Tracker** — 2024 election results with charts

### Innovative 10
6. **Values Matchmaker** — Match voter priorities to parties
7. **Debate Simulator** — AI-simulated candidate responses
8. **Fake News Radar** — Real-time claim fact-checking
9. **Constituency Dashboard** — Detailed constituency profiles
10. **Election Timeline** — Interactive phase-wise timeline
11. **First-Time Voter Story** — 8-screen comic with Voti mascot
12. **Multilingual AI Chat** — EN/HI streaming chat assistant
13. **Voter Rights Guide** — 10 rights + complaint system
14. **Election Budget Tracker** — Spending visualization
15. **Manifesto Analyzer** — Side-by-side party comparison

### Bonus 4
16. **Progress Tracker** — Civic journey with badges
17. **WhatsApp Share** — Every page shareable
18. **Quiz Arena** — 3 difficulty levels, timer-based
19. **Promise Scorecard** — AI promise vs reality analysis

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Maps | React-Leaflet |
| Icons | Lucide React |
| Backend | FastAPI + Python |
| AI | Claude AI (claude-sonnet-4-6) |
| Notifications | React Hot Toast |

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:8000 (default)
npm run dev
# Opens at http://localhost:5173
```

### 3. Environment Variables

**backend/.env**
```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Streaming AI chat |
| POST | /api/factcheck | Fact check a claim |
| POST | /api/constituency | Constituency info |
| POST | /api/candidates/debate | Debate simulator |
| POST | /api/values/match | Values matchmaker |
| GET | /api/timeline | Election timeline |
| GET | /api/candidates | Candidate data |
| POST | /api/registration/check | Registration AI guide |
| GET | /api/quiz/questions | Quiz questions |
| POST | /api/quiz/certificate | Generate certificate |
| GET | /health | Health check |

---

## Project Structure

```
vote/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   ├── .env
│   ├── routers/
│   │   ├── chat.py
│   │   ├── factcheck.py
│   │   ├── constituency.py
│   │   ├── candidates.py
│   │   ├── timeline.py
│   │   └── values.py
│   ├── services/
│   │   └── claude_service.py
│   ├── models/
│   │   └── schemas.py
│   └── data/
│       ├── candidates.json
│       ├── timeline.json
│       └── constituencies.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/         # 19 page components
    │   ├── components/    # Shared components
    │   └── utils/
    │       └── api.js
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Disclaimer

VoteSmart AI is a nonpartisan educational platform built for the PromptWars hackathon. All AI-generated content is for educational purposes only. For official election information, visit **eci.gov.in**.

---

*Built with ❤️ for India's democracy | PromptWars by Google for Developers*
