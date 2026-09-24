// ============================================================
// SHARED TYPES — Module 2: User, Talent & Career Intelligence
// ============================================================

// ---- Roles & Auth ----
export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'EMPLOYER_ADMIN' | 'WORKFORCE_PLANNER' | 'ADMIN';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  jti?: string;
}

// ---- API Response ----
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    requestId: string;
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

// ---- Intelligence Provider Types (Module 1 contract) ----
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  experienceRequired: { min: number; max: number };
  skills: string[];
  salary?: { min: number; max: number; currency: string };
  postedAt: string;
  source: string;
}

export interface JobSearchQuery {
  keywords?: string;
  skills?: string[];
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  employmentType?: string;
  page?: number;
  pageSize?: number;
}

export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  relatedSkills: string[];
}

export interface Role {
  id: string;
  title: string;
  name?: string;
  category: string;
  description: string;
  seniorityLevels: string[];
}

export interface RoleRequirements {
  roleId: string;
  roleName?: string;
  skills: Array<{
    skillId: string;
    skillName: string;
    requiredScore: number;
    importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  experienceYears: { min: number; max: number };
  education: string[];
  certifications: string[];
}

export interface MarketSkillSignal {
  skillId: string;
  skillName: string;
  demand: number;
  trend: 'EMERGING' | 'GROWING' | 'STABLE' | 'DECLINING';
  growthRate: number;
  jobCount: number;
  averageCompensationImpact: number;
}

export interface MarketRoleSignal {
  roleId: string;
  roleName: string;
  demand: number;
  trend: 'EMERGING' | 'GROWING' | 'STABLE' | 'DECLINING';
  growthRate: number;
  openPositions: number;
  averageCompensation: { min: number; max: number; currency: string };
}

export interface CompensationQuery {
  roleId?: string;
  skillIds?: string[];
  location?: string;
  experienceYears?: number;
}

export interface CompensationData {
  role?: string;
  location?: string;
  experienceYears?: number;
  observed: { min: number; median: number; max: number; currency: string };
  sampleSize: number;
  freshness: string;
  breakdown?: Array<{
    factor: string;
    value: string;
    impact: number;
  }>;
}

export interface ForecastQuery {
  skillIds?: string[];
  roleIds?: string[];
  horizon: '3m' | '6m' | '12m' | '24m';
  location?: string;
}

export interface ForecastData {
  horizon: string;
  predictions: Array<{
    entityType: 'skill' | 'role';
    entityId: string;
    entityName: string;
    currentDemand: number;
    predictedDemand: number;
    confidence: number;
    trend: string;
  }>;
  generatedAt: string;
  modelVersion: string;
}

// ---- Candidate Types ----
export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  headline?: string;
  bio?: string;
  location?: string;
  targetRoles: string[];
  preferredLocations: string[];
  employmentPreferences: string[];
  portfolioLinks: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateSkillProfile {
  skillId: string;
  skillName: string;
  selfReportedScore: number | null;
  assessmentScore: number | null;
  verifiedScore: number | null;
  confidence: number;
  lastAssessedAt: string | null;
  source: 'SELF_REPORTED' | 'ASSESSMENT' | 'VERIFIED';
}

export interface CandidateExperience {
  id: string;
  candidateId: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills: string[];
}

export interface CandidateEducation {
  id: string;
  candidateId: string;
  degree: string;
  institution: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
}

export interface CandidateCertification {
  id: string;
  candidateId: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  credentialId?: string;
  url?: string;
}

// ---- Assessment Types ----
export type QuestionType = 'MCQ' | 'MULTIPLE_ANSWER' | 'CODING' | 'SCENARIO';
export type AssessmentStatus = 'CREATED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'FLAGGED';
export type IntegrityEventType = 'FOCUS_LOST' | 'TAB_CHANGED' | 'FULLSCREEN_EXIT' | 'CAMERA_PRESENCE_CHANGE' | 'MULTIPLE_PERSON_SIGNAL';

export interface AssessmentDefinition {
  id: string;
  title: string;
  description: string;
  targetRoleId: string;
  skills: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  durationMinutes: number;
  questionCount: number;
  rules: string[];
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswers?: string[];
  skillIds: string[];
  difficulty: number;
  points: number;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  startedAt: string;
  submittedAt?: string;
  status: AssessmentStatus;
  score?: number;
  skillScores?: Record<string, number>;
  integritySummary?: IntegritySummary;
}

export interface IntegrityEvent {
  id: string;
  attemptId: string;
  eventType: IntegrityEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string;
}

export interface IntegritySummary {
  totalEvents: number;
  eventsByType: Record<string, number>;
  highSeverityCount: number;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ---- Skill Gap ----
export interface SkillGap {
  skillId: string;
  skillName: string;
  currentScore: number;
  requiredScore: number;
  gap: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  marketDemand: number;
  reason: string;
}

// ---- Job Matching ----
export interface JobMatch {
  jobId: string;
  job: Job;
  overallMatch: number;
  skillMatch: number;
  experienceMatch: number;
  roleMatch: number;
  locationMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
}

// ---- Simulation ----
export interface SimulationInput {
  targetRoleId: string;
  skillChanges: Array<{
    skillId: string;
    targetScore: number;
  }>;
}

export interface SimulationResult {
  roleReadiness: number;
  skillCoverage: number;
  remainingGaps: SkillGap[];
  compatibleJobsEstimate: { total: number; improvement: number };
  learningRequirements: Array<{
    skillId: string;
    skillName: string;
    currentScore: number;
    targetScore: number;
    estimatedHours: number;
  }>;
  disclaimer: string;
}

export interface CareerScenario {
  id: string;
  userId: string;
  name: string;
  targetRoleId: string;
  skillChanges: Array<{ skillId: string; targetScore: number }>;
  result: SimulationResult;
  createdAt: string;
  modelVersion: string;
}

// ---- Learning ----
export interface LearningResource {
  id: string;
  title: string;
  type: 'COURSE' | 'TUTORIAL' | 'DOCUMENTATION' | 'PROJECT' | 'PRACTICE' | 'VIDEO' | 'ARTICLE';
  url: string;
  provider: string;
  skillIds: string[];
  roleIds: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDurationHours: number;
  source: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  targetRoleId: string;
  resources: Array<{
    resourceId: string;
    order: number;
    skillId: string;
    reason: string;
  }>;
  createdAt: string;
}

export interface LearningProgress {
  id: string;
  userId: string;
  resourceId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  timeSpentMinutes: number;
  startedAt?: string;
  completedAt?: string;
}

// ---- Interview Intelligence ----
export interface InterviewQuestion {
  id: string;
  company: string;
  roleId: string;
  question: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'TECHNICAL' | 'CODING' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'ROLE_SPECIFIC';
  reportedAt: string;
  source: 'REPORTED' | 'OFFICIAL';
}

export interface InterviewPreparationSet {
  roleId: string;
  company?: string;
  questions: InterviewQuestion[];
  topics: string[];
  focusAreas: Array<{
    area: string;
    reason: string;
    relevance: number;
  }>;
}

// ---- Research Intelligence ----
export interface ResearchItem {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  summary?: string;
  publishedAt: string;
  source: string;
  originalUrl: string;
  topics: string[];
  skillIds: string[];
  roleIds: string[];
  type: 'ORIGINAL_PAPER' | 'AI_SUMMARY' | 'INDUSTRY_ARTICLE' | 'OPINION';
}

// ---- Employer / Organization ----
export type OrganizationRole = 'ADMIN' | 'RECRUITER' | 'WORKFORCE_PLANNER' | 'VIEWER';

export interface Organization {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  createdAt: string;
}

export interface TalentSearchQuery {
  skills?: string[];
  minimumSkillScore?: number;
  roleId?: string;
  experienceYears?: number;
  location?: string;
  assessmentScore?: number;
  availability?: string;
  page?: number;
  pageSize?: number;
}

export interface TalentSearchResult {
  candidateId: string;
  name: string;
  headline?: string;
  relevantSkills: Array<{ skillName: string; score: number }>;
  experienceYears: number;
  roleReadiness: number;
  explanation: string;
}

export type ShortlistStatus = 'DISCOVERED' | 'REVIEWING' | 'SHORTLISTED' | 'CONTACTED' | 'ARCHIVED';

// ---- Workforce ----
export interface WorkforceProfile {
  id: string;
  organizationId: string;
  employeeRef: string;
  skills: Array<{ skillId: string; skillName: string; score: number }>;
  role: string;
  experienceYears: number;
  department: string;
  location: string;
}

export interface WorkforceGapResult {
  organizationId: string;
  currentCapability: Record<string, number>;
  targetCapability: Record<string, number>;
  gaps: Array<{
    skillId: string;
    skillName: string;
    currentAvg: number;
    targetAvg: number;
    gap: number;
    headcount: number;
    strategy: 'UPSKILL' | 'RESKILL' | 'HIRE' | 'COMBINATION';
  }>;
  summary: {
    totalSkillShortages: number;
    criticalGaps: number;
    developmentOpportunities: number;
  };
}

// ---- Notifications ----
export type NotificationType =
  | 'ASSESSMENT_RESULT'
  | 'NEW_RECOMMENDATION'
  | 'SKILL_GAP_UPDATE'
  | 'LEARNING_MILESTONE'
  | 'JOB_RECOMMENDATION'
  | 'EMPLOYER_ACTION';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ---- Audit ----
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}
