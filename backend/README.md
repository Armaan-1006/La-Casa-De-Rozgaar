# La Casa De Rozgaar — Module 2 Backend
## User, Talent & Career Intelligence Engine

### Overview
Module 2 is the core application intelligence backend for the **La Casa De Rozgaar** workforce and talent intelligence platform. It provides independently runnable, independently testable, API-contract driven services powering:

- **Identity, RBAC & Authentication**: JWT authentication with session rotation, role-based access control (`candidate`, `recruiter`, `employer`, `admin`, `workforce_planner`), and structured audit logging.
- **Candidate Profiles & Verified Skills**: Multi-tier skill scoring (self-reported, assessment-verified, market-weighted), education, experience, and privacy-first visibility controls.
- **Secure Assessment Engine**: Anti-cheat integrity signal monitoring (tab switching, copy/paste detection, time anomalies, device anomalies), automated grading, and instant skill score verification.
- **Explainable Job Matching**: Multi-dimensional weighted compatibility scoring (skills 40%, experience 25%, role 20%, location 15%) with transparent match explanations.
- **Skill Gap Analysis**: Target role benchmark comparison against real-time intelligence feeds with prioritized learning urgency indicators.
- **Career What-If Simulation**: Scenario modeling with projected readiness gains, skill coverage changes, and estimated study hour requirements.
- **Personalized Learning & Interview Intelligence**: Gap-targeted learning resource ranking, company-specific interview question sets, and candidate debrief reports.
- **Employer Talent Discovery & Shortlisting**: Privacy-respecting candidate search, candidate-role match calculation, and workflow pipeline tracking.
- **Workforce Intelligence & Gap Analysis**: Department-level competency mapping, employee impact counts, and automated Hire vs. Upskill decision modeling.
- **Intelligence Provider Abstraction**: Loosely coupled architecture that seamlessly operates in **MOCK** mode (fully self-contained) or connects to **Module 1** via REST API.

---

### Quick Start

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Run Database Migrations & Seed
```bash
npm run migrate
npm run seed
```

#### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3001` with hot-reload enabled.

#### 4. Run Test Suite
```bash
npm test
```

---

### Pre-seeded Test Accounts

All accounts share the password: `password123`

| Email | Role | Description |
| :--- | :--- | :--- |
| `admin@lacasaderozgaar.com` | `admin` | Platform administrator with full access |
| `rahul@example.com` | `candidate` | Senior Full Stack Developer (7 skills, 2 exp entries) |
| `priya@example.com` | `candidate` | Data Scientist & ML Engineer (4 skills, 1 exp entry) |
| `recruiter@techcorp.com` | `recruiter` | Recruiter at TechCorp India |
| `employer@techcorp.com` | `employer` | Employer Admin at TechCorp India |
| `planner@techcorp.com` | `workforce_planner` | Workforce Strategist at TechCorp India |

---

### Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Express server port |
| `HOST` | `0.0.0.0` | Server host binding |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `DATABASE_PATH` | `./data/module2.db` | SQLite database file location |
| `JWT_SECRET` | `secret-key` | JWT signature secret |
| `JWT_EXPIRES_IN` | `7d` | Access token expiration |
| `INTELLIGENCE_PROVIDER` | `mock` | Switch between `mock` and `remote` (Module 1 connection) |
| `MODULE1_API_URL` | `http://localhost:3000/api/v1` | URL for Module 1 REST endpoints |
| `MODULE1_API_KEY` | - | Optional API key for Module 1 authentication |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (Vite frontend) |

---

### Architecture & Folder Structure

```
backend/
├── data/                    # SQLite database store (auto-created)
├── src/
│   ├── __tests__/           # Integration test suites (Vitest + Supertest)
│   │   ├── assessments.test.ts
│   │   ├── auth.test.ts
│   │   ├── candidates.test.ts
│   │   ├── matching.test.ts
│   │   ├── simulation.test.ts
│   │   └── workforce.test.ts
│   ├── database/            # SQLite connection, DDL migrations, seed data
│   │   ├── connection.ts
│   │   ├── migrate.ts
│   │   └── seed.ts
│   ├── docs/                # OpenAPI 3.0 specification & generator
│   │   ├── generateOpenApi.ts
│   │   └── openapi.json
│   ├── intelligence/        # Intelligence Provider abstraction (Mock & Remote)
│   │   ├── index.ts
│   │   ├── mockProvider.ts
│   │   ├── provider.ts
│   │   └── remoteProvider.ts
│   ├── middleware/          # JWT auth, RBAC, org check, error handling
│   │   └── auth.ts
│   ├── routes/              # Modular Express Route handlers
│   │   ├── assessments.ts
│   │   ├── auth.ts
│   │   ├── candidates.ts
│   │   ├── compensation.ts
│   │   ├── employer.ts
│   │   ├── interviews.ts
│   │   ├── learning.ts
│   │   ├── matching.ts
│   │   ├── notifications.ts
│   │   ├── recommendations.ts
│   │   ├── research.ts
│   │   ├── simulation.ts
│   │   ├── skillGaps.ts
│   │   ├── talent.ts
│   │   ├── users.ts
│   │   └── workforce.ts
│   ├── config.ts            # Environment configuration
│   ├── server.ts            # Server entry point & Express application factory
│   └── types.ts             # TypeScript domain definitions
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

### API Route Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Service health & database connectivity check |
| `POST` | `/api/v1/auth/register` | Public | Register user & initialize candidate profile |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT tokens |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/api/v1/candidates/profile` | Authenticated | Candidate full profile with skills & history |
| `PUT` | `/api/v1/candidates/profile` | Candidate | Update candidate profile |
| `POST` | `/api/v1/candidates/skills` | Candidate | Add/update verified or self-reported skill |
| `GET` | `/api/v1/assessments` | Authenticated | List all active skill assessments |
| `POST` | `/api/v1/assessments/:id/attempt` | Candidate | Begin assessment attempt |
| `POST` | `/api/v1/assessments/attempts/:id/integrity` | Candidate | Log anti-cheat event (`TAB_SWITCH`, `COPY_PASTE`) |
| `POST` | `/api/v1/assessments/attempts/:id/submit` | Candidate | Submit for grading & skill verification |
| `POST` | `/api/v1/skill-gaps/calculate` | Candidate | Calculate gaps against intelligence benchmark |
| `POST` | `/api/v1/matching/jobs/:jobId` | Candidate | Calculate explainable job match score |
| `GET` | `/api/v1/matching/jobs/recommended` | Candidate | Ranked recommended jobs |
| `POST` | `/api/v1/simulation` | Authenticated | Run what-if career projection simulation |
| `POST` | `/api/v1/simulation/scenarios` | Authenticated | Save simulated career scenario |
| `GET` | `/api/v1/learning/recommended` | Candidate | Personalized gap-targeted learning items |
| `GET` | `/api/v1/interviews/preparation` | Candidate | Company/role personalized interview prep set |
| `POST` | `/api/v1/talent/search` | Employer/Recruiter | Search talent pool with role match scoring |
| `POST` | `/api/v1/workforce/gaps/analyze` | Employer/Planner | Departmental skill gap analysis |
| `POST` | `/api/v1/workforce/gaps/recommendation`| Employer/Planner | Automated Hire vs Upskill decision matrix |
