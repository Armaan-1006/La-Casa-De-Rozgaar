import type { IntelligenceProvider } from './provider.js';
import type {
  Job, JobSearchQuery, JobSearchResult,
  Skill, Role, RoleRequirements,
  MarketSkillSignal, MarketRoleSignal,
  CompensationQuery, CompensationData,
  ForecastQuery, ForecastData
} from '../types.js';

// ============================================================
// MOCK DATA STORES
// ============================================================

const MOCK_SKILLS: Record<string, Skill> = {
  skill_javascript: { id: 'skill_javascript', name: 'JavaScript', category: 'Programming Languages', description: 'Dynamic programming language for web development', relatedSkills: ['skill_typescript', 'skill_react', 'skill_nodejs'] },
  skill_typescript: { id: 'skill_typescript', name: 'TypeScript', category: 'Programming Languages', description: 'Typed superset of JavaScript', relatedSkills: ['skill_javascript', 'skill_react', 'skill_nodejs'] },
  skill_react: { id: 'skill_react', name: 'React', category: 'Frontend Frameworks', description: 'JavaScript library for building user interfaces', relatedSkills: ['skill_javascript', 'skill_typescript'] },
  skill_nodejs: { id: 'skill_nodejs', name: 'Node.js', category: 'Backend', description: 'JavaScript runtime for server-side development', relatedSkills: ['skill_javascript', 'skill_typescript', 'skill_express'] },
  skill_python: { id: 'skill_python', name: 'Python', category: 'Programming Languages', description: 'General-purpose programming language', relatedSkills: ['skill_ml', 'skill_tensorflow'] },
  skill_sql: { id: 'skill_sql', name: 'SQL', category: 'Databases', description: 'Structured Query Language for database management', relatedSkills: ['skill_postgresql', 'skill_mysql'] },
  skill_docker: { id: 'skill_docker', name: 'Docker', category: 'DevOps', description: 'Container platform for application deployment', relatedSkills: ['skill_kubernetes', 'skill_aws'] },
  skill_aws: { id: 'skill_aws', name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud platform', relatedSkills: ['skill_docker', 'skill_kubernetes'] },
  skill_ml: { id: 'skill_ml', name: 'Machine Learning', category: 'AI/ML', description: 'Building systems that learn from data', relatedSkills: ['skill_python', 'skill_tensorflow'] },
  skill_tensorflow: { id: 'skill_tensorflow', name: 'TensorFlow', category: 'AI/ML', description: 'Open-source ML framework by Google', relatedSkills: ['skill_python', 'skill_ml'] },
  skill_kubernetes: { id: 'skill_kubernetes', name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration platform', relatedSkills: ['skill_docker', 'skill_aws'] },
  skill_java: { id: 'skill_java', name: 'Java', category: 'Programming Languages', description: 'Object-oriented programming language', relatedSkills: ['skill_spring'] },
  skill_spring: { id: 'skill_spring', name: 'Spring Boot', category: 'Backend', description: 'Java-based enterprise framework', relatedSkills: ['skill_java'] },
  skill_go: { id: 'skill_go', name: 'Go', category: 'Programming Languages', description: 'Statically typed compiled language by Google', relatedSkills: ['skill_docker', 'skill_kubernetes'] },
  skill_system_design: { id: 'skill_system_design', name: 'System Design', category: 'Architecture', description: 'Designing scalable distributed systems', relatedSkills: ['skill_aws', 'skill_docker'] },
};

const MOCK_ROLES: Record<string, Role> = {
  role_fullstack: { id: 'role_fullstack', title: 'Full Stack Developer', category: 'Engineering', description: 'Develops both frontend and backend of applications', seniorityLevels: ['Junior', 'Mid', 'Senior', 'Lead'] },
  role_frontend: { id: 'role_frontend', title: 'Frontend Developer', category: 'Engineering', description: 'Specializes in user interfaces and client-side development', seniorityLevels: ['Junior', 'Mid', 'Senior'] },
  role_backend: { id: 'role_backend', title: 'Backend Developer', category: 'Engineering', description: 'Focuses on server-side logic and APIs', seniorityLevels: ['Junior', 'Mid', 'Senior', 'Lead'] },
  role_datascientist: { id: 'role_datascientist', title: 'Data Scientist', category: 'Data & Analytics', description: 'Analyses data and builds ML models', seniorityLevels: ['Junior', 'Mid', 'Senior'] },
  role_mleng: { id: 'role_mleng', title: 'ML Engineer', category: 'AI/ML', description: 'Builds and deploys machine learning systems', seniorityLevels: ['Mid', 'Senior', 'Lead'] },
  role_devops: { id: 'role_devops', title: 'DevOps Engineer', category: 'Infrastructure', description: 'Manages CI/CD, infrastructure, and deployments', seniorityLevels: ['Junior', 'Mid', 'Senior'] },
  role_sre: { id: 'role_sre', title: 'Site Reliability Engineer', category: 'Infrastructure', description: 'Ensures reliability and scalability of production systems', seniorityLevels: ['Mid', 'Senior', 'Staff'] },
};

const MOCK_ROLE_REQUIREMENTS: Record<string, RoleRequirements> = {
  role_fullstack: {
    roleId: 'role_fullstack',
    skills: [
      { skillId: 'skill_javascript', skillName: 'JavaScript', requiredScore: 7.5, importance: 'CRITICAL' },
      { skillId: 'skill_react', skillName: 'React', requiredScore: 7.0, importance: 'HIGH' },
      { skillId: 'skill_nodejs', skillName: 'Node.js', requiredScore: 7.0, importance: 'HIGH' },
      { skillId: 'skill_typescript', skillName: 'TypeScript', requiredScore: 6.0, importance: 'MEDIUM' },
      { skillId: 'skill_sql', skillName: 'SQL', requiredScore: 6.5, importance: 'HIGH' },
      { skillId: 'skill_docker', skillName: 'Docker', requiredScore: 5.0, importance: 'MEDIUM' },
      { skillId: 'skill_aws', skillName: 'AWS', requiredScore: 4.5, importance: 'LOW' },
      { skillId: 'skill_system_design', skillName: 'System Design', requiredScore: 5.5, importance: 'MEDIUM' },
    ],
    experienceYears: { min: 2, max: 8 },
    education: ['B.Tech', 'B.E.', 'MCA', 'M.Tech'],
    certifications: [],
  },
  role_frontend: {
    roleId: 'role_frontend',
    skills: [
      { skillId: 'skill_javascript', skillName: 'JavaScript', requiredScore: 8.0, importance: 'CRITICAL' },
      { skillId: 'skill_react', skillName: 'React', requiredScore: 8.0, importance: 'CRITICAL' },
      { skillId: 'skill_typescript', skillName: 'TypeScript', requiredScore: 7.0, importance: 'HIGH' },
    ],
    experienceYears: { min: 1, max: 6 },
    education: ['B.Tech', 'B.E.', 'MCA'],
    certifications: [],
  },
  role_datascientist: {
    roleId: 'role_datascientist',
    skills: [
      { skillId: 'skill_python', skillName: 'Python', requiredScore: 8.0, importance: 'CRITICAL' },
      { skillId: 'skill_ml', skillName: 'Machine Learning', requiredScore: 7.5, importance: 'CRITICAL' },
      { skillId: 'skill_sql', skillName: 'SQL', requiredScore: 6.5, importance: 'HIGH' },
      { skillId: 'skill_tensorflow', skillName: 'TensorFlow', requiredScore: 6.0, importance: 'MEDIUM' },
    ],
    experienceYears: { min: 1, max: 7 },
    education: ['B.Tech', 'M.Tech', 'M.Sc', 'PhD'],
    certifications: [],
  },
  role_devops: {
    roleId: 'role_devops',
    skills: [
      { skillId: 'skill_docker', skillName: 'Docker', requiredScore: 8.0, importance: 'CRITICAL' },
      { skillId: 'skill_kubernetes', skillName: 'Kubernetes', requiredScore: 7.0, importance: 'HIGH' },
      { skillId: 'skill_aws', skillName: 'AWS', requiredScore: 7.5, importance: 'CRITICAL' },
      { skillId: 'skill_python', skillName: 'Python', requiredScore: 5.0, importance: 'MEDIUM' },
    ],
    experienceYears: { min: 2, max: 8 },
    education: ['B.Tech', 'B.E.'],
    certifications: ['AWS Solutions Architect', 'CKA'],
  },
  role_mleng: {
    roleId: 'role_mleng',
    skills: [
      { skillId: 'skill_python', skillName: 'Python', requiredScore: 8.5, importance: 'CRITICAL' },
      { skillId: 'skill_ml', skillName: 'Machine Learning', requiredScore: 8.0, importance: 'CRITICAL' },
      { skillId: 'skill_tensorflow', skillName: 'TensorFlow', requiredScore: 7.5, importance: 'HIGH' },
      { skillId: 'skill_docker', skillName: 'Docker', requiredScore: 5.0, importance: 'MEDIUM' },
      { skillId: 'skill_aws', skillName: 'AWS', requiredScore: 5.0, importance: 'MEDIUM' },
    ],
    experienceYears: { min: 2, max: 10 },
    education: ['M.Tech', 'M.Sc', 'PhD'],
    certifications: [],
  },
};

const MOCK_JOBS: Job[] = [
  {
    id: 'job_001', title: 'Senior Full Stack Developer', company: 'TechCorp India',
    description: 'Build scalable web applications using React, Node.js, and cloud services.',
    location: 'Bangalore, India', employmentType: 'FULL_TIME',
    experienceRequired: { min: 3, max: 7 }, skills: ['skill_javascript', 'skill_react', 'skill_nodejs', 'skill_typescript', 'skill_docker', 'skill_aws'],
    salary: { min: 1500000, max: 2800000, currency: 'INR' }, postedAt: '2026-09-15', source: 'MOCK'
  },
  {
    id: 'job_002', title: 'Frontend Developer', company: 'StartupXYZ',
    description: 'Create beautiful and performant user interfaces for our SaaS platform.',
    location: 'Remote', employmentType: 'FULL_TIME',
    experienceRequired: { min: 2, max: 5 }, skills: ['skill_javascript', 'skill_react', 'skill_typescript'],
    salary: { min: 1000000, max: 2000000, currency: 'INR' }, postedAt: '2026-09-18', source: 'MOCK'
  },
  {
    id: 'job_003', title: 'Data Scientist', company: 'Analytics Pro',
    description: 'Develop ML models for predictive analytics and recommendation systems.',
    location: 'Mumbai, India', employmentType: 'FULL_TIME',
    experienceRequired: { min: 2, max: 6 }, skills: ['skill_python', 'skill_ml', 'skill_tensorflow', 'skill_sql'],
    salary: { min: 1800000, max: 3200000, currency: 'INR' }, postedAt: '2026-09-20', source: 'MOCK'
  },
  {
    id: 'job_004', title: 'Backend Developer', company: 'FinTech Co',
    description: 'Build high-performance APIs and microservices for financial applications.',
    location: 'Hyderabad, India', employmentType: 'FULL_TIME',
    experienceRequired: { min: 3, max: 8 }, skills: ['skill_nodejs', 'skill_typescript', 'skill_sql', 'skill_docker', 'skill_aws'],
    salary: { min: 1400000, max: 2600000, currency: 'INR' }, postedAt: '2026-09-22', source: 'MOCK'
  },
  {
    id: 'job_005', title: 'ML Engineer', company: 'AI Solutions Ltd',
    description: 'Design and deploy production ML pipelines for enterprise clients.',
    location: 'Bangalore, India', employmentType: 'FULL_TIME',
    experienceRequired: { min: 3, max: 7 }, skills: ['skill_python', 'skill_ml', 'skill_tensorflow', 'skill_docker', 'skill_aws'],
    salary: { min: 2000000, max: 3500000, currency: 'INR' }, postedAt: '2026-09-21', source: 'MOCK'
  },
  {
    id: 'job_006', title: 'DevOps Engineer', company: 'CloudOps India',
    description: 'Manage CI/CD pipelines, infrastructure, and container orchestration.',
    location: 'Pune, India', employmentType: 'FULL_TIME',
    experienceRequired: { min: 2, max: 6 }, skills: ['skill_docker', 'skill_kubernetes', 'skill_aws', 'skill_python'],
    salary: { min: 1200000, max: 2400000, currency: 'INR' }, postedAt: '2026-09-19', source: 'MOCK'
  },
  {
    id: 'job_007', title: 'Full Stack Developer', company: 'EduTech Platform',
    description: 'Develop and maintain educational technology platform frontend and backend.',
    location: 'Remote', employmentType: 'FULL_TIME',
    experienceRequired: { min: 1, max: 4 }, skills: ['skill_javascript', 'skill_react', 'skill_nodejs', 'skill_sql'],
    salary: { min: 800000, max: 1600000, currency: 'INR' }, postedAt: '2026-09-23', source: 'MOCK'
  },
];

const MOCK_MARKET_SKILL_SIGNALS: Record<string, MarketSkillSignal> = {
  skill_javascript: { skillId: 'skill_javascript', skillName: 'JavaScript', demand: 92, trend: 'STABLE', growthRate: 3.2, jobCount: 14200, averageCompensationImpact: 12 },
  skill_typescript: { skillId: 'skill_typescript', skillName: 'TypeScript', demand: 88, trend: 'GROWING', growthRate: 18.4, jobCount: 11800, averageCompensationImpact: 15 },
  skill_react: { skillId: 'skill_react', skillName: 'React', demand: 87, trend: 'STABLE', growthRate: 5.1, jobCount: 12400, averageCompensationImpact: 14 },
  skill_nodejs: { skillId: 'skill_nodejs', skillName: 'Node.js', demand: 78, trend: 'STABLE', growthRate: 4.8, jobCount: 9600, averageCompensationImpact: 11 },
  skill_python: { skillId: 'skill_python', skillName: 'Python', demand: 91, trend: 'GROWING', growthRate: 12.3, jobCount: 15800, averageCompensationImpact: 16 },
  skill_sql: { skillId: 'skill_sql', skillName: 'SQL', demand: 82, trend: 'STABLE', growthRate: 2.1, jobCount: 13200, averageCompensationImpact: 8 },
  skill_docker: { skillId: 'skill_docker', skillName: 'Docker', demand: 74, trend: 'GROWING', growthRate: 15.2, jobCount: 8400, averageCompensationImpact: 13 },
  skill_aws: { skillId: 'skill_aws', skillName: 'AWS', demand: 79, trend: 'GROWING', growthRate: 14.8, jobCount: 10200, averageCompensationImpact: 18 },
  skill_ml: { skillId: 'skill_ml', skillName: 'Machine Learning', demand: 85, trend: 'GROWING', growthRate: 22.5, jobCount: 7800, averageCompensationImpact: 25 },
  skill_tensorflow: { skillId: 'skill_tensorflow', skillName: 'TensorFlow', demand: 68, trend: 'STABLE', growthRate: 6.3, jobCount: 4200, averageCompensationImpact: 20 },
  skill_kubernetes: { skillId: 'skill_kubernetes', skillName: 'Kubernetes', demand: 71, trend: 'GROWING', growthRate: 19.1, jobCount: 6800, averageCompensationImpact: 17 },
  skill_go: { skillId: 'skill_go', skillName: 'Go', demand: 62, trend: 'EMERGING', growthRate: 28.4, jobCount: 3400, averageCompensationImpact: 19 },
  skill_system_design: { skillId: 'skill_system_design', skillName: 'System Design', demand: 76, trend: 'GROWING', growthRate: 10.2, jobCount: 7200, averageCompensationImpact: 22 },
};

const MOCK_MARKET_ROLE_SIGNALS: Record<string, MarketRoleSignal> = {
  role_fullstack: { roleId: 'role_fullstack', roleName: 'Full Stack Developer', demand: 89, trend: 'GROWING', growthRate: 12.1, openPositions: 9240, averageCompensation: { min: 1200000, max: 2800000, currency: 'INR' } },
  role_frontend: { roleId: 'role_frontend', roleName: 'Frontend Developer', demand: 82, trend: 'STABLE', growthRate: 5.2, openPositions: 7800, averageCompensation: { min: 800000, max: 2200000, currency: 'INR' } },
  role_backend: { roleId: 'role_backend', roleName: 'Backend Developer', demand: 84, trend: 'STABLE', growthRate: 6.8, openPositions: 8100, averageCompensation: { min: 1000000, max: 2600000, currency: 'INR' } },
  role_datascientist: { roleId: 'role_datascientist', roleName: 'Data Scientist', demand: 88, trend: 'GROWING', growthRate: 18.4, openPositions: 5400, averageCompensation: { min: 1500000, max: 3200000, currency: 'INR' } },
  role_mleng: { roleId: 'role_mleng', roleName: 'ML Engineer', demand: 91, trend: 'GROWING', growthRate: 24.6, openPositions: 3200, averageCompensation: { min: 2000000, max: 4000000, currency: 'INR' } },
  role_devops: { roleId: 'role_devops', roleName: 'DevOps Engineer', demand: 78, trend: 'GROWING', growthRate: 14.3, openPositions: 4800, averageCompensation: { min: 1200000, max: 2800000, currency: 'INR' } },
};

// ============================================================
// MOCK INTELLIGENCE PROVIDER
// ============================================================

export class MockIntelligenceProvider implements IntelligenceProvider {
  async getJob(jobId: string): Promise<Job | null> {
    const num = jobId.replace(/\D/g, '');
    const padded = num ? `job_${num.padStart(3, '0')}` : jobId;
    return MOCK_JOBS.find(j => j.id === jobId || j.id === padded || j.id === `job_${num}`) || null;
  }

  async searchJobs(query: JobSearchQuery): Promise<JobSearchResult> {
    let results = [...MOCK_JOBS];

    if (query.keywords) {
      const kw = query.keywords.toLowerCase();
      results = results.filter(j =>
        j.title.toLowerCase().includes(kw) ||
        j.description.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw)
      );
    }
    if (query.skills?.length) {
      results = results.filter(j => query.skills!.some(s => j.skills.includes(s)));
    }
    if (query.location) {
      const loc = query.location.toLowerCase();
      results = results.filter(j => j.location.toLowerCase().includes(loc));
    }
    if (query.employmentType) {
      results = results.filter(j => j.employmentType === query.employmentType);
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 25;
    const start = (page - 1) * pageSize;

    return {
      jobs: results.slice(start, start + pageSize),
      total: results.length,
      page,
      pageSize,
    };
  }

  async getSkill(skillId: string): Promise<Skill | null> {
    return MOCK_SKILLS[skillId] || null;
  }

  async searchSkills(query: string): Promise<Skill[]> {
    const q = query.toLowerCase();
    return Object.values(MOCK_SKILLS).filter(s =>
      s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }

  async getRole(roleId: string): Promise<Role | null> {
    return MOCK_ROLES[roleId] || null;
  }

  async getRoleRequirements(roleId: string): Promise<RoleRequirements | null> {
    return MOCK_ROLE_REQUIREMENTS[roleId] || null;
  }

  async searchRoles(query: string): Promise<Role[]> {
    const q = query.toLowerCase();
    return Object.values(MOCK_ROLES).filter(r =>
      r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    );
  }

  async getMarketSkillSignal(skillId: string): Promise<MarketSkillSignal | null> {
    return MOCK_MARKET_SKILL_SIGNALS[skillId] || null;
  }

  async getMarketRoleSignal(roleId: string): Promise<MarketRoleSignal | null> {
    return MOCK_MARKET_ROLE_SIGNALS[roleId] || null;
  }

  async getCompensation(query: CompensationQuery): Promise<CompensationData | null> {
    const roleSignal = query.roleId ? MOCK_MARKET_ROLE_SIGNALS[query.roleId] : null;
    if (roleSignal) {
      const base = roleSignal.averageCompensation;
      let multiplier = 1.0;
      if (query.experienceYears) {
        multiplier = 0.7 + (query.experienceYears * 0.1);
      }
      return {
        role: roleSignal.roleName,
        location: query.location || 'India',
        experienceYears: query.experienceYears,
        observed: {
          min: Math.round(base.min * multiplier),
          median: Math.round(((base.min + base.max) / 2) * multiplier),
          max: Math.round(base.max * multiplier),
          currency: base.currency,
        },
        sampleSize: 342,
        freshness: '2026-09-24',
        breakdown: [
          { factor: 'Role', value: roleSignal.roleName, impact: 40 },
          { factor: 'Experience', value: `${query.experienceYears || 'N/A'} years`, impact: 30 },
          { factor: 'Location', value: query.location || 'India', impact: 20 },
          { factor: 'Skills', value: 'Profile match', impact: 10 },
        ],
      };
    }
    return null;
  }

  async getForecast(query: ForecastQuery): Promise<ForecastData> {
    const predictions = [];
    for (const skillId of (query.skillIds || [])) {
      const signal = MOCK_MARKET_SKILL_SIGNALS[skillId];
      if (signal) {
        const horizonMultiplier = query.horizon === '3m' ? 1.02 : query.horizon === '6m' ? 1.05 : query.horizon === '12m' ? 1.1 : 1.2;
        predictions.push({
          entityType: 'skill' as const,
          entityId: skillId,
          entityName: signal.skillName,
          currentDemand: signal.demand,
          predictedDemand: Math.round(signal.demand * horizonMultiplier),
          confidence: 0.72,
          trend: signal.trend,
        });
      }
    }
    for (const roleId of (query.roleIds || [])) {
      const signal = MOCK_MARKET_ROLE_SIGNALS[roleId];
      if (signal) {
        const horizonMultiplier = query.horizon === '3m' ? 1.03 : query.horizon === '6m' ? 1.06 : query.horizon === '12m' ? 1.12 : 1.22;
        predictions.push({
          entityType: 'role' as const,
          entityId: roleId,
          entityName: signal.roleName,
          currentDemand: signal.demand,
          predictedDemand: Math.round(signal.demand * horizonMultiplier),
          confidence: 0.68,
          trend: signal.trend,
        });
      }
    }

    return {
      horizon: query.horizon,
      predictions,
      generatedAt: new Date().toISOString(),
      modelVersion: 'mock-1.0',
    };
  }
}
