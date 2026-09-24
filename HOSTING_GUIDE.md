# La Casa De Rozgaar — Deployment & Hosting Guide
**Version:** 1.0.0  
**Last Verified:** 2026-09-25

---

## Architecture Stack

| Layer | Technology | Port | Purpose |
|---|---|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion | `5173` | Interactive Intelligence & Career Dashboard |
| **Module 2 API** | Node.js, Express, SQLite, TypeScript | `3001` | Candidate, Assessment, Matching & Employer Workflows |
| **Module 1 API** | Node.js, Fastify, PostgreSQL, TypeScript | `3000` | Ingestion, Skills Taxonomy, Market Analytics & Forecasting |
| **Database (M1)** | PostgreSQL 16 (with `pg_trgm`, `uuid-ossp`) | `5432` | Data Lake & Market Intelligence Engine |
| **Database (M2)** | SQLite 3 (`module2.db`) | File | Application & User Identity Storage |

---

## 🚀 Quick Start (Local Development)

### Method 1: Docker Compose (All Services)
```bash
docker compose up -d
```
- Frontend: `http://localhost:5173`
- Module 1 API Docs: `http://localhost:3000/api/docs`
- Module 2 Health: `http://localhost:3001/health`

### Method 2: Standalone Local Run

#### 1. Start Module 2 (Self-Contained Mode)
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```
*Module 2 starts on `http://localhost:3001` with pre-seeded mock intelligence.*

#### 2. Start Frontend
```bash
# In the root directory:
npm install
npm run dev
```
*Frontend starts on `http://localhost:5173`.*

---

## 🌐 Production Cloud Hosting Options

### Option A: Vercel / Netlify (Frontend) + Render / Railway (Backends)

1. **Frontend (Vercel / Netlify):**
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL`: `https://your-module2-backend.onrender.com/api/v1`

2. **Module 2 (Render / Railway Web Service):**
   - Root Directory: `backend`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start`
   - Environment Variables:
     - `PORT`: `3001`
     - `NODE_ENV`: `production`
     - `INTELLIGENCE_PROVIDER`: `mock` (or `remote`)
     - `JWT_SECRET`: `<secure-random-32-char-string>`
     - `CORS_ORIGIN`: `https://your-frontend.vercel.app`

3. **Module 1 (Render / Railway PostgreSQL + Web Service):**
   - Deploy managed PostgreSQL
   - Deploy Module 1 as Web Service pointing to PostgreSQL
   - Set `INTELLIGENCE_PROVIDER=remote` in Module 2

---

## 🧪 Verification & Health Checks

```bash
# Frontend build check:
npm run lint
npm run build

# Module 2 test suite (22/22 passing):
cd backend && npm test

# Module 1 typecheck:
cd backend/module-1-intelligence && npm run typecheck
```

---

## 🔑 Default Test Accounts

All accounts share password: `password123`

| Email | Role |
|---|---|
| `admin@lacasaderozgaar.com` | `admin` |
| `rahul@example.com` | `candidate` |
| `priya@example.com` | `candidate` |
| `recruiter@techcorp.com` | `recruiter` |
| `employer@techcorp.com` | `employer` |
| `planner@techcorp.com` | `workforce_planner` |
