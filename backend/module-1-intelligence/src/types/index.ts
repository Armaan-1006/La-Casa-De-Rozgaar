// Core domain types for Module 1 - Intelligence Platform

// ============================================================================
// JOB TYPES
// ============================================================================

export interface RawJobRecord {
  source: string;
  externalId?: string;
  title: string;
  description?: string;
  companyName?: string;
  industry?: string;
  location?: string;
  employmentType?: string; // full-time, part-time, contract, etc.
  workMode?: string; // remote, hybrid, onsite
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string; // annual, monthly, hourly
  experienceMin?: number;
  experienceMax?: number;
  education?: string[];
  skills?: string[];
  postedAt?: string;
  expiresAt?: string;
  sourceUrl?: string;
  rawPayload?: unknown;
}

export interface Job {
  id: string;
  source: string;
  externalId?: string;
  canonicalJobId?: string; // Link to canonical record if duplicate

  // Basic info
  title: string;
  normalizedRole?: string;
  roleId?: string;
  description?: string;

  // Company
  companyName?: string;
  industry?: string;

  // Location
  location?: string;
  country?: string;
  state?: string;
  city?: string;
  isRemote: boolean;
  isHybrid: boolean;
  isOnsite: boolean;

  // Employment
  employmentType?: string;

  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod?: string;

  // Requirements
  experienceMin?: number;
  experienceMax?: number;
  seniorityLevel?: string;
  education?: string[];

  // Metadata
  postedAt?: Date;
  expiresAt?: Date;
  sourceUrl?: string;

  // Processing
  processingStatus: 'pending' | 'processed' | 'failed';
  extractionConfidence?: number;
  isDuplicate: boolean;
  duplicateOf?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSkill {
  jobId: string;
  skillId: string;
  isRequired: boolean;
  confidence: number;
  source: 'extraction' | 'manual' | 'inferred';
}

// ============================================================================
// SKILL TYPES
// ============================================================================

export interface Skill {
  id: string;
  canonicalName: string;
  category?: string; // programming-language, framework, tool, domain, soft-skill
  parentSkillId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillAlias {
  id: string;
  skillId: string;
  alias: string;
  confidence: number;
  createdAt: Date;
}

export interface SkillDemand {
  skillId: string;
  canonicalName: string;
  totalJobs: number;
  growthRate: number;
  trend: TrendStatus;
  lastUpdated: Date;
}

export interface SkillRelationship {
  skillId1: string;
  skillId2: string;
  relationshipType: 'related' | 'prerequisite' | 'alternative';
  cooccurrenceCount: number;
  strength: number;
}

// ============================================================================
// ROLE TYPES
// ============================================================================

export interface Role {
  id: string;
  canonicalName: string;
  roleFamily?: string; // engineering, data, design, product, etc.
  seniorityLevel?: string; // entry, mid, senior, lead, principal
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleSkillRequirement {
  roleId: string;
  skillId: string;
  importance: 'required' | 'preferred' | 'optional';
  averageRequirement: number; // 0-10 scale
  frequency: number; // How often this skill appears for this role
}

export interface RoleDemand {
  roleId: string;
  canonicalName: string;
  totalJobs: number;
  growthRate: number;
  trend: TrendStatus;
  lastUpdated: Date;
}

// ============================================================================
// MARKET INTELLIGENCE TYPES
// ============================================================================

export interface MarketObservation {
  id: string;
  metricType: 'skill_demand' | 'role_demand' | 'compensation' | 'geographic_demand';
  entityType: 'skill' | 'role' | 'location' | 'industry';
  entityId: string;
  value: number;
  period: Date;
  sampleSize: number;
  confidence: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface MarketOverview {
  totalJobs: number;
  totalActiveJobs: number;
  totalSkills: number;
  totalRoles: number;
  topSkills: SkillDemand[];
  topRoles: RoleDemand[];
  emergingSkills: EmergingSignal[];
  dataFreshness: DataFreshness;
}

// ============================================================================
// TREND TYPES
// ============================================================================

export type TrendStatus =
  | 'EMERGING'
  | 'GROWING'
  | 'STABLE'
  | 'DECLINING'
  | 'HIGH_DEMAND';

export interface TrendAnalysis {
  entityType: 'skill' | 'role';
  entityId: string;
  entityName: string;
  status: TrendStatus;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  period: string;
  sampleSize: number;
  confidence: number;
  calculatedAt: Date;
}

export interface EmergingSignal {
  entityType: 'skill' | 'role';
  entityId: string;
  entityName: string;
  growthRate: number;
  currentDemand: number;
  signalStrength: number; // 0-1
  firstSeen: Date;
  detectedAt: Date;
}

// ============================================================================
// COMPENSATION TYPES
// ============================================================================

export interface CompensationObservation {
  id: string;
  jobId?: string;
  roleId?: string;
  skillIds?: string[];

  salaryMin: number;
  salaryMax: number;
  currency: string;
  period: string;

  experienceYears?: number;
  location?: string;
  country?: string;

  observedAt: Date;
  confidence: number;
  source: string;
  createdAt: Date;
}

export interface CompensationAnalytics {
  roleId?: string;
  skillId?: string;
  location?: string;
  experienceRange?: string;

  medianSalary: number;
  p25Salary: number;
  p75Salary: number;
  minSalary: number;
  maxSalary: number;
  currency: string;

  sampleSize: number;
  confidence: number;
  lastUpdated: Date;
}

// ============================================================================
// FORECAST TYPES
// ============================================================================

export interface Forecast {
  id: string;
  forecastType: 'skill_demand' | 'role_demand' | 'geographic_demand';
  entityType: 'skill' | 'role' | 'location';
  entityId: string;
  entityName: string;

  currentValue: number;
  forecastedValue: number;
  horizon: number; // days
  forecastDate: Date;

  model: string;
  modelVersion: string;
  trainingPeriod: string;
  sampleSize: number;
  confidence: number;
  uncertainty?: number;

  generatedAt: Date;
}

// ============================================================================
// DATA QUALITY TYPES
// ============================================================================

export interface DataQualityRecord {
  id: string;
  checkType: 'completeness' | 'validity' | 'consistency' | 'freshness' | 'accuracy';
  entityType: 'job' | 'skill' | 'role';

  passed: boolean;
  score: number; // 0-1
  issues?: string[];
  metadata?: Record<string, any>;

  checkedAt: Date;
}

export interface DataFreshness {
  source: string;
  lastCollected: Date;
  lastUpdated: Date;
  observationCount: number;
  freshnessStatus: 'fresh' | 'warning' | 'stale';
  confidence: number;
}

// ============================================================================
// INGESTION TYPES
// ============================================================================

export interface IngestionRun {
  id: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';

  recordsIngested: number;
  recordsProcessed: number;
  recordsFailed: number;
  recordsDuplicate: number;

  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface SearchFilters {
  query?: string;
  skills?: string[];
  roles?: string[];
  location?: string;
  isRemote?: boolean;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: string[];
  postedAfter?: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    mlService: 'up' | 'down';
  };
}
