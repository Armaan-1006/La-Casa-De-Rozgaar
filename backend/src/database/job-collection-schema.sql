-- ============================================================================
-- JOB COLLECTION & MARKET INTELLIGENCE SCHEMA
-- La Casa De Rozgaar - Data Collection Layer
-- ============================================================================

-- Raw job postings from external sources (APIs, scrapers, feeds)
CREATE TABLE IF NOT EXISTS job_postings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Source tracking
  source TEXT NOT NULL CHECK(source IN ('indeed', 'github', 'remoteok', 'adzuna', 'naukri', 'linkedin', 'manual', 'rss')),
  source_id TEXT, -- External ID from platform
  source_url TEXT,
  
  -- Core job information
  title TEXT NOT NULL,
  company TEXT,
  company_id TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  
  -- Job details
  description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  benefits TEXT,
  
  -- Employment details
  employment_type TEXT CHECK(employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE')),
  remote_type TEXT CHECK(remote_type IN ('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE')),
  
  -- Experience & education
  experience_min INTEGER,
  experience_max INTEGER,
  education_level TEXT,
  
  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'INR',
  salary_period TEXT CHECK(salary_period IN ('YEARLY', 'MONTHLY', 'HOURLY')),
  
  -- Skills (JSON array of skill names/IDs)
  skills JSON DEFAULT '[]',
  required_skills JSON DEFAULT '[]',
  preferred_skills JSON DEFAULT '[]',
  
  -- Metadata
  industry TEXT,
  category TEXT,
  seniority_level TEXT,
  application_url TEXT,
  application_email TEXT,
  
  -- Dates
  posted_at TEXT, -- Original posting date from source
  expires_at TEXT,
  collected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Processing status
  processed INTEGER DEFAULT 0 CHECK(processed IN (0, 1)),
  normalized INTEGER DEFAULT 0 CHECK(normalized IN (0, 1)),
  skills_extracted INTEGER DEFAULT 0 CHECK(skills_extracted IN (0, 1)),
  
  -- Quality metadata
  data_quality_score REAL DEFAULT 0.0 CHECK(data_quality_score >= 0 AND data_quality_score <= 1),
  raw_data JSON, -- Original scraped/API data for debugging
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate jobs from same source
  UNIQUE(source, source_id)
);

-- Indexes for job postings
CREATE INDEX IF NOT EXISTS idx_job_postings_source ON job_postings(source);
CREATE INDEX IF NOT EXISTS idx_job_postings_processed ON job_postings(processed);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(city, state);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_at ON job_postings(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company);
CREATE INDEX IF NOT EXISTS idx_job_postings_title ON job_postings(title);

-- Data ingestion logs
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Source info
  source TEXT NOT NULL,
  collector_type TEXT, -- 'api', 'scraper', 'rss', 'manual'
  
  -- Batch info
  batch_id TEXT,
  total_jobs INTEGER DEFAULT 0,
  new_jobs INTEGER DEFAULT 0,
  updated_jobs INTEGER DEFAULT 0,
  duplicate_jobs INTEGER DEFAULT 0,
  failed_jobs INTEGER DEFAULT 0,
  
  -- Status
  status TEXT CHECK(status IN ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL')),
  error_message TEXT,
  
  -- Metadata
  metadata JSON, -- API limits, rate info, etc.
  
  -- Timestamps
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  duration_seconds REAL,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_source ON ingestion_logs(source);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_started_at ON ingestion_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_status ON ingestion_logs(status);

-- Market skill demand (aggregated from job postings)
CREATE TABLE IF NOT EXISTS market_skill_demand (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  skill_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  
  -- Current demand metrics
  job_count INTEGER DEFAULT 0, -- Jobs requiring this skill
  demand_percentage REAL DEFAULT 0.0, -- % of all jobs
  
  -- Trend analysis (vs previous period)
  previous_job_count INTEGER DEFAULT 0,
  trend_percentage REAL DEFAULT 0.0,
  momentum TEXT CHECK(momentum IN ('EMERGING', 'ACCELERATING', 'GROWING', 'STABLE', 'DECLINING', 'CRITICAL')),
  
  -- Market signals
  avg_salary_min INTEGER,
  avg_salary_max INTEGER,
  avg_experience_required REAL,
  
  -- Co-occurrence (skills that appear together)
  paired_skills JSON DEFAULT '[]', -- [{skillId, frequency}]
  
  -- Role associations
  top_roles JSON DEFAULT '[]', -- [{roleId, frequency}]
  
  -- Location distribution
  top_locations JSON DEFAULT '[]', -- [{location, count}]
  
  -- Category
  category TEXT, -- 'Frontend', 'Backend', 'DevOps', 'AI/ML', etc.
  urgency TEXT CHECK(urgency IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
  
  -- Calculation metadata
  sample_size INTEGER DEFAULT 0,
  data_quality REAL DEFAULT 0.0,
  last_calculated TEXT NOT NULL,
  calculation_period TEXT, -- '7d', '30d', '90d'
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(skill_id, calculation_period)
);

CREATE INDEX IF NOT EXISTS idx_market_skill_demand_skill_id ON market_skill_demand(skill_id);
CREATE INDEX IF NOT EXISTS idx_market_skill_demand_job_count ON market_skill_demand(job_count DESC);
CREATE INDEX IF NOT EXISTS idx_market_skill_demand_momentum ON market_skill_demand(momentum);
CREATE INDEX IF NOT EXISTS idx_market_skill_demand_last_calculated ON market_skill_demand(last_calculated DESC);

-- Market role demand (aggregated from job postings)
CREATE TABLE IF NOT EXISTS market_role_demand (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  role_id TEXT NOT NULL,
  role_name TEXT NOT NULL,
  
  -- Current demand metrics
  job_count INTEGER DEFAULT 0,
  demand_percentage REAL DEFAULT 0.0,
  
  -- Trend analysis
  previous_job_count INTEGER DEFAULT 0,
  trend_percentage REAL DEFAULT 0.0,
  growth_rate TEXT CHECK(growth_rate IN ('EXPLOSIVE', 'RAPID', 'MODERATE', 'STABLE', 'DECLINING')),
  
  -- Compensation
  avg_salary_min INTEGER,
  avg_salary_max INTEGER,
  salary_p25 INTEGER, -- 25th percentile
  salary_p50 INTEGER, -- Median
  salary_p75 INTEGER, -- 75th percentile
  salary_p90 INTEGER, -- 90th percentile
  
  -- Experience
  avg_experience_min REAL,
  avg_experience_max REAL,
  
  -- Top skills required
  top_skills JSON DEFAULT '[]', -- [{skillId, frequency, avgScore}]
  emerging_skills JSON DEFAULT '[]', -- Fast-growing skills for this role
  
  -- Location distribution
  top_locations JSON DEFAULT '[]',
  remote_percentage REAL DEFAULT 0.0,
  
  -- Industry distribution
  top_industries JSON DEFAULT '[]',
  
  -- Metadata
  sample_size INTEGER DEFAULT 0,
  data_quality REAL DEFAULT 0.0,
  last_calculated TEXT NOT NULL,
  calculation_period TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(role_id, calculation_period)
);

CREATE INDEX IF NOT EXISTS idx_market_role_demand_role_id ON market_role_demand(role_id);
CREATE INDEX IF NOT EXISTS idx_market_role_demand_job_count ON market_role_demand(job_count DESC);
CREATE INDEX IF NOT EXISTS idx_market_role_demand_growth_rate ON market_role_demand(growth_rate);
CREATE INDEX IF NOT EXISTS idx_market_role_demand_last_calculated ON market_role_demand(last_calculated DESC);

-- Compensation benchmarks (aggregated by role, location, experience)
CREATE TABLE IF NOT EXISTS compensation_benchmarks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Segmentation
  role_id TEXT,
  role_name TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  experience_min INTEGER,
  experience_max INTEGER,
  
  -- Salary statistics
  salary_min_avg INTEGER,
  salary_max_avg INTEGER,
  salary_p25 INTEGER,
  salary_p50 INTEGER,
  salary_p75 INTEGER,
  salary_p90 INTEGER,
  salary_currency TEXT DEFAULT 'INR',
  
  -- Metadata
  sample_size INTEGER DEFAULT 0,
  confidence_score REAL DEFAULT 0.0, -- 0-1 based on sample size
  outliers_removed INTEGER DEFAULT 0,
  
  last_calculated TEXT NOT NULL,
  calculation_period TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(role_id, location, experience_min, experience_max, calculation_period)
);

CREATE INDEX IF NOT EXISTS idx_compensation_benchmarks_role ON compensation_benchmarks(role_id);
CREATE INDEX IF NOT EXISTS idx_compensation_benchmarks_location ON compensation_benchmarks(location);
CREATE INDEX IF NOT EXISTS idx_compensation_benchmarks_experience ON compensation_benchmarks(experience_min, experience_max);

-- Skill extraction queue (for async NLP processing)
CREATE TABLE IF NOT EXISTS skill_extraction_queue (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  job_posting_id TEXT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  
  status TEXT CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
  priority INTEGER DEFAULT 5 CHECK(priority >= 1 AND priority <= 10),
  
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT,
  
  UNIQUE(job_posting_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_extraction_queue_status ON skill_extraction_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_skill_extraction_queue_job_posting ON skill_extraction_queue(job_posting_id);

-- Data collection schedule (tracks when each source was last collected)
CREATE TABLE IF NOT EXISTS collection_schedule (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  source TEXT NOT NULL UNIQUE,
  collector_type TEXT,
  
  enabled INTEGER DEFAULT 1 CHECK(enabled IN (0, 1)),
  
  -- Schedule config
  frequency_minutes INTEGER DEFAULT 60, -- How often to run
  last_run_at TEXT,
  next_run_at TEXT,
  
  -- Performance metrics
  avg_duration_seconds REAL,
  avg_jobs_collected INTEGER,
  success_rate REAL DEFAULT 1.0,
  
  -- Rate limiting
  rate_limit_requests_per_minute INTEGER,
  rate_limit_requests_per_day INTEGER,
  
  -- API credentials (encrypted in production)
  api_key TEXT,
  api_secret TEXT,
  config JSON, -- Source-specific configuration
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_collection_schedule_next_run ON collection_schedule(next_run_at);
CREATE INDEX IF NOT EXISTS idx_collection_schedule_enabled ON collection_schedule(enabled);
