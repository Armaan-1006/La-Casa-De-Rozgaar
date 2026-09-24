# Module 1 Integration Guide for Module 2

**La Casa De Rozgaar - Backend Integration Contract**

## Overview

This document defines how **Module 2 (User, Talent & Career Intelligence)** should integrate with **Module 1 (Intelligence & Data Platform)**.

---

## ⚠️ CRITICAL RULES

### 1. **API-Only Communication**
Module 2 **MUST** communicate with Module 1 exclusively through REST APIs.

✅ **ALLOWED:**
- HTTP requests to Module 1 API endpoints
- Consuming JSON responses
- Caching API responses

❌ **FORBIDDEN:**
- Direct database access to Module 1 tables
- Database-level foreign keys to Module 1
- SQL queries against Module 1 schema
- Sharing database connections

### 2. **Data Ownership**
- Module 1 owns: Jobs, Skills, Roles, Market Intelligence, Trends, Forecasts
- Module 2 owns: Candidates, Assessments, Recommendations, Career Plans, Employer Workflows
- Module 2 can store Module 1 IDs (job_id, skill_id, role_id) as strings
- Module 2 should periodically refresh cached Module 1 data

### 3. **Independence**
- Each module should be independently deployable
- Module 1 downtime should not crash Module 2 (implement fallbacks)
- Module 2 should implement retry logic and circuit breakers
- Use cached data when Module 1 is unavailable

---

## 🔌 API Base URL

### Development
```
http://localhost:3001/api/v1
```

### Production
```
https://api.lacasaderozgaar.com/intelligence/v1
```

---

## 🔑 Authentication

### API Key (for ingestion endpoints)
```http
POST /api/v1/jobs/ingest
X-API-Key: your-api-key
```

### Public Endpoints
Most read endpoints are public (no auth required for MVP).

---

## 📚 Core API Endpoints

### 1. Jobs

#### Search Jobs
```http
GET /api/v1/jobs?query=developer&location=bangalore&isRemote=true&page=1&pageSize=25
```

**Query Parameters:**
- `query` (string): Search term for title/description/company
- `roleId` (uuid): Filter by role
- `skillIds` (uuid[]): Filter by skills (comma-separated)
- `location` (string): Filter by location
- `isRemote` (boolean): Remote jobs only
- `experienceMin` (number): Minimum experience in years
- `experienceMax` (number): Maximum experience in years
- `salaryMin` (number): Minimum salary
- `salaryMax` (number): Maximum salary
- `employmentType` (string[]): full-time, part-time, contract
- `page` (number): Page number (default: 1)
- `pageSize` (number): Results per page (default: 25, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "title": "Senior Full Stack Developer",
        "normalizedRole": "Full Stack Developer",
        "roleId": "uuid",
        "description": "...",
        "companyName": "Tech Corp",
        "industry": "Technology",
        "location": "Bangalore, Karnataka, India",
        "country": "India",
        "state": "Karnataka",
        "city": "Bangalore",
        "isRemote": true,
        "isHybrid": false,
        "isOnsite": false,
        "employmentType": "full-time",
        "salaryMin": 1200000,
        "salaryMax": 2000000,
        "salaryCurrency": "INR",
        "salaryPeriod": "annual",
        "experienceMin": 3,
        "experienceMax": 7,
        "seniorityLevel": "mid",
        "education": ["Bachelor's in Computer Science"],
        "postedAt": "2026-09-20T10:00:00Z",
        "expiresAt": "2026-10-20T10:00:00Z",
        "sourceUrl": "https://...",
        "createdAt": "2026-09-20T10:05:00Z",
        "updatedAt": "2026-09-20T10:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "total": 150,
      "totalPages": 6
    }
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-09-24T20:00:00Z"
  }
}
```

#### Get Job Details
```http
GET /api/v1/jobs/{jobId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job": { /* same structure as above */ },
    "skills": [
      {
        "skillId": "uuid",
        "canonicalName": "JavaScript",
        "category": "programming-language",
        "isRequired": true,
        "confidence": 0.95
      }
    ]
  }
}
```

---

### 2. Skills

#### List Skills
```http
GET /api/v1/skills?category=programming-language&search=java&page=1&pageSize=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "id": "uuid",
        "canonicalName": "JavaScript",
        "category": "programming-language",
        "parentSkillId": null,
        "description": "Programming language for web development",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-09-20T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 500,
      "totalPages": 10
    }
  }
}
```

#### Get Skill Details
```http
GET /api/v1/skills/{skillId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "skill": { /* skill object */ },
    "demand": {
      "totalJobs": 1250,
      "growthRate": 15.5,
      "trend": "GROWING"
    },
    "relatedSkills": [
      {
        "id": "uuid",
        "canonicalName": "TypeScript",
        "strength": 0.85,
        "cooccurrenceCount": 890
      }
    ]
  }
}
```

#### Get Skill Trends
```http
GET /api/v1/skills/{skillId}/trends?period=90d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2026-09",
        "demand": 1250,
        "changePercent": 12.5,
        "status": "GROWING"
      }
    ]
  }
}
```

---

### 3. Roles

#### List Roles
```http
GET /api/v1/roles?roleFamily=engineering&seniorityLevel=mid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "uuid",
        "canonicalName": "Full Stack Developer",
        "roleFamily": "engineering",
        "seniorityLevel": "mid",
        "description": "...",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-09-20T00:00:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Get Role Skills
```http
GET /api/v1/roles/{roleId}/skills
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requirements": [
      {
        "skillId": "uuid",
        "skillName": "JavaScript",
        "category": "programming-language",
        "importance": "required",
        "averageRequirement": 8.5,
        "frequency": 950
      }
    ]
  }
}
```

---

### 4. Market Intelligence

#### Market Overview
```http
GET /api/v1/market/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 25000,
    "totalActiveJobs": 18500,
    "totalSkills": 850,
    "totalRoles": 120,
    "topSkills": [
      {
        "skillId": "uuid",
        "canonicalName": "Python",
        "totalJobs": 5200,
        "growthRate": 18.5,
        "trend": "GROWING"
      }
    ],
    "topRoles": [
      {
        "roleId": "uuid",
        "canonicalName": "Software Engineer",
        "totalJobs": 4800,
        "growthRate": 12.0,
        "trend": "STABLE"
      }
    ],
    "emergingSkills": [
      {
        "skillId": "uuid",
        "skillName": "Rust",
        "growthRate": 85.5,
        "signalStrength": 0.78
      }
    ],
    "dataFreshness": {
      "lastCollected": "2026-09-24T18:00:00Z",
      "lastUpdated": "2026-09-24T19:00:00Z",
      "observationCount": 25000,
      "freshnessStatus": "fresh"
    }
  }
}
```

#### Skill Demand Analytics
```http
GET /api/v1/market/skills?limit=20
```

#### Role Demand Analytics
```http
GET /api/v1/market/roles?limit=20
```

---

### 5. Trends

#### Skill Trends
```http
GET /api/v1/trends/skills?status=EMERGING&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "entityId": "uuid",
        "entityName": "WebAssembly",
        "status": "EMERGING",
        "currentValue": 180,
        "previousValue": 95,
        "changePercent": 89.5,
        "period": "30d",
        "sampleSize": 180,
        "confidence": 0.82,
        "calculatedAt": "2026-09-24T19:00:00Z"
      }
    ]
  }
}
```

#### Emerging Signals
```http
GET /api/v1/trends/emerging?entityType=skill&limit=20
```

---

### 6. Compensation

#### Compensation Analytics
```http
GET /api/v1/compensation?roleId={uuid}&location=bangalore&experienceRange=3-5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "medianSalary": 1500000,
      "p25Salary": 1200000,
      "p75Salary": 1800000,
      "minSalary": 800000,
      "maxSalary": 2500000,
      "currency": "INR",
      "sampleSize": 450,
      "confidence": 0.88,
      "lastUpdated": "2026-09-24T19:00:00Z"
    }
  }
}
```

#### Role Compensation
```http
GET /api/v1/compensation/roles/{roleId}
```

---

### 7. Forecasts

#### Skill Demand Forecasts
```http
GET /api/v1/forecasts/skills?horizon=90&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "forecasts": [
      {
        "entityId": "uuid",
        "entityName": "React",
        "currentValue": 3200,
        "forecastedValue": 3680,
        "horizon": 90,
        "forecastDate": "2026-12-23",
        "model": "moving_average",
        "modelVersion": "1.0",
        "confidence": 0.75,
        "generatedAt": "2026-09-24T19:00:00Z"
      }
    ]
  }
}
```

---

## 🔄 Integration Patterns

### Pattern 1: Job Recommendation (Module 2)

```typescript
// Module 2 code
async function recommendJobsForCandidate(candidateId: string) {
  const candidate = await getCandidateProfile(candidateId);
  
  // Call Module 1 to search jobs
  const response = await fetch(
    `${MODULE_1_URL}/api/v1/jobs?` +
    `skillIds=${candidate.skillIds.join(',')}&` +
    `experienceMin=${candidate.experience - 1}&` +
    `experienceMax=${candidate.experience + 2}&` +
    `location=${candidate.location}&` +
    `page=1&pageSize=50`
  );
  
  const { data } = await response.json();
  
  // Module 2 applies its own scoring/matching logic
  const scoredJobs = data.jobs.map(job => ({
    ...job,
    matchScore: calculateMatch(candidate, job), // Module 2 logic
  }));
  
  return scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
}
```

### Pattern 2: Skill Gap Analysis (Module 2)

```typescript
// Module 2 code
async function analyzeSkillGaps(candidateId: string, targetRoleId: string) {
  const candidate = await getCandidateProfile(candidateId);
  
  // Get role requirements from Module 1
  const response = await fetch(
    `${MODULE_1_URL}/api/v1/roles/${targetRoleId}/skills`
  );
  
  const { data } = await response.json();
  const requirements = data.requirements;
  
  // Module 2 compares candidate skills vs market requirements
  const gaps = requirements.map(req => {
    const candidateSkill = candidate.skills.find(
      s => s.skillId === req.skillId
    );
    
    return {
      skillId: req.skillId,
      skillName: req.skillName,
      required: req.averageRequirement,
      current: candidateSkill?.score || 0,
      gap: req.averageRequirement - (candidateSkill?.score || 0),
      importance: req.importance,
    };
  }).filter(gap => gap.gap > 0);
  
  return gaps;
}
```

### Pattern 3: Market Intelligence Display (Module 2)

```typescript
// Module 2 code - showing market context to candidate
async function getMarketContext() {
  // Cache this for 1 hour
  const cached = cache.get('market_overview');
  if (cached) return cached;
  
  const response = await fetch(
    `${MODULE_1_URL}/api/v1/market/overview`
  );
  
  const { data } = await response.json();
  cache.set('market_overview', data, 3600); // 1 hour TTL
  
  return data;
}
```

---

## 🛡️ Error Handling

### Module 1 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Job not found",
    "details": {}
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-09-24T20:00:00Z"
  }
}
```

### Common Error Codes
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request parameters
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Module 1 is down

### Module 2 Should Implement

```typescript
async function callModule1(url: string, options = {}) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        ...options,
        timeout: 10000, // 10 second timeout
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 429) {
        // Rate limited, wait and retry
        await sleep(1000 * Math.pow(2, attempt));
        attempt++;
        continue;
      }
      
      if (response.status >= 500) {
        // Server error, retry
        attempt++;
        continue;
      }
      
      // Client error, don't retry
      throw new Error(`Module 1 error: ${response.status}`);
      
    } catch (error) {
      if (attempt >= maxRetries - 1) {
        // Fallback: use cached data or default values
        return getFallbackData();
      }
      attempt++;
    }
  }
}
```

---

## 💾 Caching Strategy

### What Module 2 Should Cache

1. **Market Overview** - TTL: 1 hour
2. **Skill List** - TTL: 24 hours
3. **Role List** - TTL: 24 hours
4. **Skill Requirements for Roles** - TTL: 12 hours
5. **Compensation Data** - TTL: 6 hours
6. **Forecasts** - TTL: 24 hours

### What NOT to Cache

1. **Job Search Results** - Always fetch fresh
2. **Individual Job Details** - Cache for 15 minutes max
3. **Trend Status** - Cache for 1 hour max

---

## 🔄 Data Freshness

Module 2 should display data freshness to users:

```typescript
const marketData = await getMarketOverview();

// Show to user
console.log(`Data last updated: ${marketData.dataFreshness.lastUpdated}`);
console.log(`Based on ${marketData.dataFreshness.observationCount} observations`);
```

---

## 🧪 Mock API for Development

Module 1 will provide a mock server for Module 2 development:

```bash
npm run mock-server
# Runs on http://localhost:3002
```

Returns realistic fake data matching the API contract.

---

## 📞 Support & Questions

- **API Issues:** Check `/api/health` endpoint first
- **Data Quality:** Check `dataFreshness` in responses
- **Performance:** Implement caching and pagination
- **Integration Help:** Review this guide and API docs at `/api/docs`

---

## ✅ Integration Checklist for Module 2

- [ ] Configure Module 1 base URL
- [ ] Implement HTTP client with retry logic
- [ ] Implement caching strategy
- [ ] Handle Module 1 downtime gracefully
- [ ] Never access Module 1 database directly
- [ ] Store Module 1 IDs as strings
- [ ] Display data freshness to users
- [ ] Implement pagination for large result sets
- [ ] Test with Module 1 mock server
- [ ] Test with Module 1 real API
- [ ] Monitor API response times
- [ ] Set up alerts for Module 1 errors

---

**Last Updated:** September 24, 2026
**API Version:** 1.0.0
**Module 1 Status:** Foundation Complete, APIs In Development
