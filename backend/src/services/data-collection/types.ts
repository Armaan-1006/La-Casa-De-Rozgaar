// ============================================================================
// DATA COLLECTION TYPES
// La Casa De Rozgaar - Job Collection & Market Intelligence
// ============================================================================

export type JobSource = 'indeed' | 'github' | 'remoteok' | 'adzuna' | 'naukri' | 'linkedin' | 'manual' | 'rss' | 'jsearch' | 'jobicy' | 'remotive' | 'arbeitnow' | 'ats' | 'weworkremotely';
export type CollectorType = 'api' | 'scraper' | 'rss' | 'manual';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type RemoteType = 'REMOTE' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE';
export type SalaryPeriod = 'YEARLY' | 'MONTHLY' | 'HOURLY';
export type IngestionStatus = 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
export type SkillMomentum = 'EMERGING' | 'ACCELERATING' | 'GROWING' | 'STABLE' | 'DECLINING' | 'CRITICAL';
export type RoleGrowthRate = 'EXPLOSIVE' | 'RAPID' | 'MODERATE' | 'STABLE' | 'DECLINING';
export type SkillUrgency = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

// ============================================================================
// RAW JOB DATA (from external sources)
// ============================================================================

export interface RawJobData {
  // Source
  source: JobSource;
  sourceId?: string;
  sourceUrl?: string;

  // Core info
  title: string;
  company?: string;
  companyId?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;

  // Details
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;

  // Employment
  employmentType?: EmploymentType;
  remoteType?: RemoteType;

  // Experience
  experienceMin?: number;
  experienceMax?: number;
  educationLevel?: string;

  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;

  // Skills
  skills?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];

  // Metadata
  industry?: string;
  category?: string;
  seniorityLevel?: string;
  applicationUrl?: string;
  applicationEmail?: string;

  // Dates
  postedAt?: string;
  expiresAt?: string;

  // Raw data for debugging
  rawData?: any;
}

// ============================================================================
// NORMALIZED JOB POSTING
// ============================================================================

export interface JobPosting {
  id: string;
  source: JobSource;
  sourceId?: string;
  sourceUrl?: string;

  title: string;
  company?: string;
  companyId?: string;
  location?: string;
  city?: string;
  state?: string;
  country: string;

  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;

  employmentType?: EmploymentType;
  remoteType?: RemoteType;

  experienceMin?: number;
  experienceMax?: number;
  educationLevel?: string;

  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod?: SalaryPeriod;

  skills: string[];
  requiredSkills: string[];
  preferredSkills: string[];

  industry?: string;
  category?: string;
  seniorityLevel?: string;
  applicationUrl?: string;
  applicationEmail?: string;

  postedAt?: string;
  expiresAt?: string;
  collectedAt: string;

  processed: boolean;
  normalized: boolean;
  skillsExtracted: boolean;
  dataQualityScore: number;

  rawData?: any;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INGESTION LOG
// ============================================================================

export interface IngestionLog {
  id: string;
  source: JobSource;
  collectorType?: CollectorType;
  batchId?: string;

  totalJobs: number;
  newJobs: number;
  updatedJobs: number;
  duplicateJobs: number;
  failedJobs: number;

  status: IngestionStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;

  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;

  createdAt: string;
}

// ============================================================================
// MARKET SKILL DEMAND
// ============================================================================

export interface MarketSkillDemand {
  id: string;
  skillId: string;
  skillName: string;

  jobCount: number;
  demandPercentage: number;

  previousJobCount: number;
  trendPercentage: number;
  momentum: SkillMomentum;

  avgSalaryMin?: number;
  avgSalaryMax?: number;
  avgExperienceRequired?: number;

  pairedSkills: Array<{ skillId: string; skillName: string; frequency: number }>;
  topRoles: Array<{ roleId: string; roleName: string; frequency: number }>;
  topLocations: Array<{ location: string; count: number }>;

  category?: string;
  urgency: SkillUrgency;

  sampleSize: number;
  dataQuality: number;
  lastCalculated: string;
  calculationPeriod?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MARKET ROLE DEMAND

// ------------------------------------------------------------
// Collector configuration and result structures (not present before)
// ------------------------------------------------------------
export interface CollectorConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  rateLimitPerMinute?: number;
  rateLimitPerDay?: number;
  timeout?: number;
  maxRetries?: number;
  [key: string]: any;
}

export interface CollectorResult {
  success: boolean;
  source: JobSource;
  jobs: RawJobData[];
  totalCount: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// ------------------------------------------------------------
// Skill‑demand aggregation output (extended version)
// ------------------------------------------------------------
export interface SkillAggregation {
  skillId: string;
  skillName: string;
  jobCount: number;
  demandPercentage: number;
  previousJobCount: number;
  trendPercentage: number;
  momentum: SkillMomentum;
  avgSalaryMin?: number;
  avgSalaryMax?: number;
  avgExperienceRequired?: number;
  pairedSkills: { skillId: string; skillName: string; frequency: number }[];
  topRoles: { roleId: string; roleName: string; frequency: number }[];
  topLocations: { location: string; count: number }[];
  category?: string;
  urgency: SkillUrgency;
  sampleSize: number;
  dataQuality: number;
  lastCalculated: string;
  calculationPeriod?: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// Skill extraction result structure
// ------------------------------------------------------------
export interface SkillExtractionResult {
  skills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  confidence: number; // 0‑1
  method: 'keyword' | 'context' | 'hybrid' | 'nlp';
}

// Retain the closing comment for role demand (future implementation)
// ============================================================================
// MARKET ROLE DEMAND
// ============================================================================

export interface MarketRoleDemand {
  id: string;
  roleId: string;
  roleName: string;

  jobCount: number;
  demandPercentage: number;

  previousJobCount: number;
  trendPercentage: number;
  growthRate: RoleGrowthRate;

  avgSalaryMin?: number;
  avgSalaryMax?: number;
  salaryP25?: number;
  salaryP50?: number;
  salaryP75?: number;
  salaryP90?: number;

  avgExperienceMin?: number;
  avgExperienceMax?: number;

  topSkills: Array<{ skillId: string; skillName: string; frequency: number; avgScore?: number }>;
  emergingSkills: Array<{ skillId: string; skillName: string; growthRate: number }>;
  topLocations: Array<{ location: string; count: number }>;
  remotePercentage: number;
  topIndustries: Array<{ industry: string; count: number }>;

  sampleSize: number;
  dataQuality: number;
  lastCalculated: string;
  calculationPeriod?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COMPENSATION BENCHMARK
// ============================================================================

export interface CompensationBenchmark {
  id: string;
  roleId?: string;
  roleName?: string;
  location?: string;
  city?: string;
  state?: string;
  experienceMin?: number;
  experienceMax?: number;

  salaryMinAvg?: number;
  salaryMaxAvg?: number;
  salaryP25?: number;
  salaryP50?: number;
  salaryP75?: number;
  salaryP90?: number;
  salaryCurrency: string;

  sampleSize: number;
  confidenceScore: number;
  outliersRemoved: number;

  lastCalculated: string;
  calculationPeriod?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COLLECTION SCHEDULE
// ============================================================================

export interface CollectionSchedule {
  id: string;
  source: JobSource;
  collectorType?: CollectorType;
  enabled: boolean;

  frequencyMinutes: number;
  lastRunAt?: string;
  nextRunAt?: string;

  avgDurationSeconds?: number;
  avgJobsCollected?: number;
  successRate: number;

  rateLimitRequestsPerMinute?: number;
  rateLimitRequestsPerDay?: number;

  apiKey?: string;
  apiSecret?: string;
  config?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COLLECTOR RESULT
// ============================================================================

export interface CollectorResult {
  success: boolean;
  source: JobSource;
  jobs: RawJobData[];
  totalCount: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// NORMALIZER RESULT
// ============================================================================

export interface NormalizerResult {
  success: boolean;
  normalized: Partial<JobPosting>;
  issues: string[];
  dataQualityScore: number;
}

// ============================================================================
// SKILL EXTRACTION RESULT
// ============================================================================

export interface SkillExtractionResult {
  skills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  confidence: number;
  method: 'keyword' | 'context' | 'hybrid' | 'nlp';
}
