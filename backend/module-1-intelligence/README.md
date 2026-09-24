# Module 1 — Intelligence & Data Platform

**La Casa De Rozgaar Backend — Market Intelligence & Data Foundation**

## Overview

This is Module 1 of the La Casa De Rozgaar backend system. It provides the intelligence and data foundation that powers market analytics, skill intelligence, role intelligence, job data, and forecasting capabilities.

Module 1 is designed to be:
- **Independently runnable**
- **Independently testable**
- **Independently deployable**
- **API-contract driven**
- **Integration-ready for Module 2**

## What Module 1 Owns

### Data Platform
- Job ingestion from permitted sources
- Job storage, normalization, and deduplication
- Skill extraction and normalization
- Role classification and normalization
- Compensation, experience, education extraction
- Market observations and signals
- Data quality monitoring
- Data freshness tracking

### Intelligence
- Skill demand analytics
- Role demand analytics
- Market trend detection
- Compensation intelligence
- Emerging skill detection
- Geographic demand
- Industry demand
- Forecasting infrastructure

### Search
- Job search with filters
- Skill search
- Role search
- Full-text indexing

### APIs
- REST API for all intelligence and data
- OpenAPI documentation
- Stable contracts for Module 2 consumption

## What Module 1 Does NOT Own

Module 1 does NOT implement:
- Candidate registration/profiles
- Candidate assessments
- Candidate skill scoring
- Candidate job recommendations
- Career simulation
- Learning plans
- Employer workflows
- Workforce management
- Recruiter workflows

Those belong to Module 2.

## Technology Stack

### API Layer
- **Framework**: Fastify with TypeScript
- **Validation**: Zod schemas
- **Documentation**: OpenAPI/Swagger

### Database
- **Primary Database**: PostgreSQL 16+
- **Search**: PostgreSQL full-text search (pg_trgm extension)
- **Migrations**: node-pg-migrate

### Background Processing
- **Queue**: BullMQ with Redis
- **Workers**: Separate worker processes

### AI/ML
- **NLP**: Python microservice for skill extraction and classification
- **Models**: Transformers-based models for entity extraction

## Project Structure

```
backend/module-1-intelligence/
├── src/
│   ├── config/              # Configuration management
│   ├── db/                  # Database connection, models
│   ├── modules/
│   │   ├── ingestion/       # Data ingestion pipelines
│   │   ├── jobs/            # Job management
│   │   ├── skills/          # Skill intelligence
│   │   ├── roles/           # Role intelligence
│   │   ├── market/          # Market analytics
│   │   ├── trends/          # Trend detection
│   │   ├── compensation/    # Compensation analytics
│   │   ├── forecasts/       # Forecasting
│   │   ├── search/          # Search functionality
│   │   └── quality/         # Data quality
│   ├── workers/             # Background job processors
│   ├── ml/                  # ML service clients
│   ├── middleware/          # Auth, validation, logging
│   ├── utils/               # Shared utilities
│   ├── types/               # TypeScript types
│   ├── app.ts               # Fastify app setup
│   └── server.ts            # Server entry point
├── ml-service/              # Python NLP service
│   ├── app/
│   │   ├── models/          # ML model loading
│   │   ├── extractors/      # Skill/entity extractors
│   │   ├── classifiers/     # Role classifiers
│   │   └── api.py           # FastAPI endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── migrations/              # Database migrations
├── seed/                    # Seed data for development
├── tests/                   # Unit and integration tests
├── scripts/                 # Utility scripts
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## API Endpoints

### Jobs
- `GET /api/v1/jobs` - Search jobs with filters
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs/ingest` - Ingest new job data

### Skills
- `GET /api/v1/skills` - List skills with stats
- `GET /api/v1/skills/:id` - Get skill details
- `GET /api/v1/skills/:id/trends` - Get skill trends

### Roles
- `GET /api/v1/roles` - List roles with stats
- `GET /api/v1/roles/:id` - Get role details
- `GET /api/v1/roles/:id/skills` - Get role-skill requirements

### Market Intelligence
- `GET /api/v1/market/overview` - Market overview stats
- `GET /api/v1/market/skills` - Skill demand analytics
- `GET /api/v1/market/roles` - Role demand analytics
- `GET /api/v1/market/geographic` - Geographic demand

### Trends
- `GET /api/v1/trends/skills` - Skill trend analysis
- `GET /api/v1/trends/roles` - Role trend analysis
- `GET /api/v1/trends/emerging` - Emerging signals

### Compensation
- `GET /api/v1/compensation` - Compensation analytics
- `GET /api/v1/compensation/roles/:roleId` - Role compensation

### Forecasts
- `GET /api/v1/forecasts/skills` - Skill demand forecasts
- `GET /api/v1/forecasts/roles` - Role demand forecasts

### Search
- `GET /api/v1/search/jobs` - Job search
- `GET /api/v1/search/skills` - Skill search
- `GET /api/v1/search/roles` - Role search

## Data Pipeline

```
RAW JOB DATA (from permitted sources)
    ↓
VALIDATION
    ↓
CLEANING & DEDUPLICATION
    ↓
NLP EXTRACTION (ML Service)
    ↓
NORMALIZATION
    ↓
STORAGE (PostgreSQL)
    ↓
INDEXING (Full-text search)
    ↓
ANALYTICS AGGREGATION
    ↓
API CONSUMPTION
```

## Running the Application

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Python 3.11+ (for ML service)
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone and Install**
```bash
cd backend/module-1-intelligence
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Start Dependencies**
```bash
docker-compose up -d postgres redis
```

4. **Run Migrations**
```bash
npm run migrate:up
```

5. **Seed Data (Optional)**
```bash
npm run seed
```

6. **Start ML Service**
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.api
```

7. **Start API Server**
```bash
npm run dev
```

8. **Start Workers**
```bash
npm run worker
```

### Using Docker Compose

```bash
docker-compose up
```

This starts:
- PostgreSQL
- Redis
- API server
- ML service
- Background workers

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# API contract tests
npm run test:contract

# All tests
npm run test:all
```

## Database Schema

Key tables:
- `jobs` - Normalized job records
- `raw_jobs` - Original ingested data
- `skills` - Canonical skill definitions
- `skill_aliases` - Skill name variations
- `roles` - Canonical role definitions
- `job_skills` - Job-skill relationships
- `role_skills` - Role-skill requirements
- `market_observations` - Time-series market data
- `skill_trends` - Computed trend signals
- `compensation_observations` - Salary data points
- `forecasts` - Prediction results
- `ingestion_runs` - Ingestion job metadata
- `data_quality_records` - Quality metrics

## Integration with Module 2

Module 2 consumes Module 1 via REST API only.

Module 2 **MUST NOT**:
- Access Module 1's database directly
- Modify Module 1's tables
- Depend on Module 1's internal implementation

Module 1 provides:
- Stable REST API contracts
- OpenAPI documentation
- Mock API server for Module 2 development

## Data Sources

Module 1 ingests data from:
- Permitted public APIs
- Open datasets
- Government/open datasets
- Organization-provided datasets
- Browser extension submissions (future)

All data collection respects:
- Terms of service
- robots.txt policies
- Rate limits
- Access controls
- Privacy requirements

## Security

- API key authentication for ingestion endpoints
- Rate limiting on all endpoints
- Input validation with Zod
- SQL injection protection via parameterized queries
- Secrets managed via environment variables
- CORS configuration
- Request logging and audit trails

## Monitoring

- Structured logging (Pino)
- Request ID tracking
- Performance metrics
- Database query monitoring
- Worker job tracking
- Data quality alerts
- Ingestion health checks

## Documentation

- OpenAPI spec: `/api/docs`
- API documentation: `/api/docs/ui`
- Health check: `/api/health`
- Metrics: `/api/metrics`

## Module Integration Contract

See `MODULE_1_INTEGRATION.md` for:
- API contracts
- Request/response examples
- Error handling
- Authentication
- Rate limits
- Integration guide for Module 2

## License

Build For Bharat 2.0 — Chandigarh University

---

**Module 1 provides the intelligence foundation. Module 2 builds the user-facing workflows on top of it.**
