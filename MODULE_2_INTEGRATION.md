# Module 2 Integration & Architecture Guide
## La Casa De Rozgaar — User, Talent & Career Intelligence

This document specifies how **Module 2 (User, Talent & Career Intelligence)** operates, how it integrates with the frontend and **Module 1 (Core Market Intelligence Engine)**, and how to verify its complete functionality.

---

## 1. System Architecture & Boundaries

```
+-------------------------------------------------------------+
|                     Frontend Layer                          |
|  React 18 + Vite + Tailwind CSS (Port 5173)                 |
|  Candidate Portal, War Room, Talent Vault, Workforce Gaps   |
+------------------------------+------------------------------+
                               | REST (JSON / Bearer JWT)
                               v
+-------------------------------------------------------------+
|               Module 2: Application Backend                 |
|           Node.js + Express + TypeScript (Port 3001)        |
|                                                             |
|  +---------------------+  +-------------------------------+ |
|  | Auth & RBAC (JWT)   |  | Secure Assessment Engine      | |
|  | Candidate Dossier   |  | Explainable Matching Engine   | |
|  | Career Simulation   |  | Learning & Interview Prep     | |
|  | Talent Discovery    |  | Workforce Intelligence        | |
|  +---------------------+  +-------------------------------+ |
|                                                             |
|           +----------------------------------+              |
|           |  Intelligence Provider Interface  |              |
|           +-----------------+----------------+              |
+-----------------------------|-------------------------------+
                              |
               +--------------+--------------+
               |                             |
               v                             v
     [Mock Provider]               [Remote Provider]
 (Built-in benchmarks)       (Calls Module 1 at :3000)
               |                             |
               v                             v
     [Module 2 SQLite DB]           [Module 1 Engine]
```

---

## 2. Intelligence Provider Mode Switching

Module 2 is designed with complete dependency isolation using the **Provider Pattern**. It can run independently of Module 1 in test/mock mode, or switch seamlessly to remote mode when Module 1 is available.

### Configuration in `backend/.env`:

#### Standalone / Mock Mode (Default):
```env
INTELLIGENCE_PROVIDER=mock
```
- Completely self-contained.
- Embedded rich dataset of 14 skills, 7 roles, detailed competency requirements, 7 job listings, market trends, salary distributions, and forecast projections.
- Zero network dependencies.

#### Connected / Remote Mode (Module 1 Live):
```env
INTELLIGENCE_PROVIDER=remote
MODULE1_API_URL=http://localhost:3000/api/v1
MODULE1_API_KEY=your-module1-api-key
```
- Fetches real-time market data, skill demand signals, compensation curves, and predictive forecasting directly from Module 1 REST endpoints.
- Auto-fallbacks gracefully on transient failures.

---

## 3. Key Core Modules & Algorithms

### 3.1 Explainable Job Matching
Matches candidates to jobs with transparent, weighted scoring:
$$\text{Score} = (S \times 0.40) + (E \times 0.25) + (R \times 0.20) + (L \times 0.15)$$
- **$S$ (Skill Match)**: Ratio of required skills held by candidate.
- **$E$ (Experience Match)**: Years of verifiable experience vs. job requirement range.
- **$R$ (Role Match)**: Target role alignment.
- **$L$ (Location Match)**: Remote compatibility or geographical overlap.

### 3.2 Secure Assessment & Anti-Cheat Engine
- Real-time client signal ingestion (`TAB_SWITCH`, `WINDOW_BLUR`, `COPY_PASTE`, `RAPID_ANSWER`, `FULLSCREEN_EXIT`).
- Automated scoring and integrity classification (`CLEAN`, `SUSPICIOUS`, `FLAGGED`, `INVALIDATED`).
- On successful completion ($\ge$ passing threshold and verified integrity), candidate skill levels are updated automatically with `assessment_score` and `verified_score`.

### 3.3 What-If Career Simulation Engine
- Computes hypothetical role readiness gains based on incremental skill improvements.
- Estimates study hours required ($20\text{ hours} \times \Delta\text{score}$).
- Calculates market-compatible job expansion multiplier.

### 3.4 Workforce Intelligence & Hire vs. Upskill
- Analyzes departmental skill coverage across employee cohorts.
- Evaluates cost, ramp time, and market talent scarcity to recommend:
  - **HIRE**: Large gap ($>4$), low internal coverage ($<30\%$), or emerging market skill.
  - **UPSKILL**: Moderate gap ($\le 2$), good baseline coverage ($>50\%$).
  - **HYBRID**: Phased transition combining recruitment with internal upskilling cohorts.

---

## 4. Frontend Integration Guide

To connect the existing Vite frontend (`http://localhost:5173`) to Module 2 backend:

1. Configure API proxy in `vite.config.ts` or set environment variable `VITE_API_URL=http://localhost:3001/api/v1`.
2. Authenticate users via `/api/v1/auth/login` and store the JWT access token in `localStorage` or `sessionStorage`.
3. Include the header `Authorization: Bearer <token>` in subsequent requests.
4. Pass `X-Request-ID` for end-to-end request tracing.

---

## 5. Verification & Testing

To run the complete automated test suite:
```bash
cd backend
npm install
npm test
```

To build production bundle:
```bash
npm run build
```

To generate OpenAPI schema:
```bash
npm run openapi
```
