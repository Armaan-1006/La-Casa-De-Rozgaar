export const mockMarketData = {
  totalJobsAnalyzed: 124530,
  totalSkillsTracked: 2847,
  totalRolesTracked: 389,
  lastUpdated: '2026-09-23',
  dataQuality: 'HIGH',

  topRoles: [
    { name: 'Software Engineer', demand: 9240, trend: '+18.4%', growth: 'up' },
    { name: 'Data Scientist', demand: 8156, trend: '+22.1%', growth: 'up' },
    { name: 'Product Manager', demand: 6823, trend: '+12.3%', growth: 'up' },
    { name: 'Full Stack Developer', demand: 7542, trend: '+15.6%', growth: 'up' },
    { name: 'Cloud Engineer', demand: 6234, trend: '+31.2%', growth: 'up' },
    { name: 'DevOps Engineer', demand: 5678, trend: '+28.9%', growth: 'up' },
  ],

  topSkills: [
    { name: 'JavaScript', demand: 78, trend: '+12.3%', momentum: 'stable' },
    { name: 'Python', demand: 76, trend: '+18.4%', momentum: 'accelerating' },
    { name: 'React', demand: 72, trend: '+14.2%', momentum: 'accelerating' },
    { name: 'AWS', demand: 68, trend: '+25.6%', momentum: 'accelerating' },
    { name: 'TypeScript', demand: 65, trend: '+31.2%', momentum: 'accelerating' },
    { name: 'SQL', demand: 63, trend: '+5.2%', momentum: 'stable' },
    { name: 'Docker', demand: 58, trend: '+22.1%', momentum: 'accelerating' },
    { name: 'Node.js', demand: 56, trend: '+16.8%', momentum: 'accelerating' },
  ],

  emergingSkills: [
    { name: 'Kubernetes', trend: '+42.3%', category: 'DevOps' },
    { name: 'GraphQL', trend: '+38.1%', category: 'Backend' },
    { name: 'Rust', trend: '+35.7%', category: 'Systems' },
    { name: 'Go', trend: '+32.4%', category: 'Backend' },
  ],

  compensationRanges: {
    softwareEngineer: {
      junior: '₹400K - ₹700K',
      mid: '₹800K - ₹1.4M',
      senior: '₹1.6M - ₹2.5M+',
    },
    dataScientist: {
      junior: '₹450K - ₹750K',
      mid: '₹900K - ₹1.5M',
      senior: '₹1.7M - ₹2.8M+',
    },
  },

  locationDemand: [
    { location: 'Bangalore', jobs: 28450, trend: '+12.3%' },
    { location: 'Hyderabad', jobs: 19230, trend: '+18.4%' },
    { location: 'Mumbai', jobs: 15680, trend: '+8.2%' },
    { location: 'Pune', jobs: 12340, trend: '+14.6%' },
    { location: 'Gurugram', jobs: 11290, trend: '+9.7%' },
  ],

  skillTrends: [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 58 },
    { month: 'Apr', value: 63 },
    { month: 'May', value: 71 },
    { month: 'Jun', value: 68 },
    { month: 'Jul', value: 75 },
    { month: 'Aug', value: 82 },
    { month: 'Sep', value: 88 },
  ],
}

export const mockCandidate = {
  id: 'CANDIDATE-001',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  profileStatus: 'VERIFIED',
  targetRole: 'Full Stack Developer',
  experience: '3 years',
  location: 'Bangalore, India',
  lastAssessment: '2026-09-20',

  skills: [
    { name: 'JavaScript', score: 8.4, market: 9.0, gap: -0.6 },
    { name: 'React', score: 8.1, market: 8.5, gap: -0.4 },
    { name: 'Node.js', score: 7.2, market: 8.0, gap: -0.8 },
    { name: 'SQL', score: 7.8, market: 8.0, gap: -0.2 },
    { name: 'TypeScript', score: 6.5, market: 8.2, gap: -1.7 },
    { name: 'Docker', score: 5.3, market: 7.0, gap: -1.7 },
    { name: 'AWS', score: 4.8, market: 7.5, gap: -2.7 },
    { name: 'Git', score: 8.6, market: 8.5, gap: 0.1 },
  ],

  roleReadiness: 76,
  assessment: {
    score: 7.6,
    category: 'STRONG',
    completedAt: '2026-09-20',
    integrity: 'VERIFIED',
  },
}

export const mockJobs = [
  {
    id: 'JOB-001',
    title: 'Full Stack Developer',
    company: 'TechCorp India',
    location: 'Bangalore, India',
    type: 'Full-time',
    remote: 'Hybrid',
    salary: '₹1.2M - ₹1.6M',
    matchScore: 87,
    matchBreakdown: {
      skillMatch: 91,
      experienceMatch: 84,
      roleMatch: 90,
      locationMatch: 95,
    },
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    preferredSkills: ['TypeScript', 'Docker', 'AWS'],
    description: 'We are looking for an experienced Full Stack Developer...',
    postedDate: '2026-09-15',
  },
  {
    id: 'JOB-002',
    title: 'Senior Frontend Engineer',
    company: 'DataFlow Systems',
    location: 'Hyderabad, India',
    type: 'Full-time',
    remote: 'Remote',
    salary: '₹1.4M - ₹1.9M',
    matchScore: 82,
    matchBreakdown: {
      skillMatch: 88,
      experienceMatch: 80,
      roleMatch: 85,
      locationMatch: 90,
    },
    requiredSkills: ['React', 'TypeScript', 'JavaScript'],
    preferredSkills: ['Next.js', 'GraphQL', 'Testing'],
    description: 'Join our frontend team building modern web applications...',
    postedDate: '2026-09-18',
  },
]

export const mockEmployer = {
  id: 'EMP-001',
  name: 'TechCorp India',
  size: 'Large',
  industry: 'Software Development',
  totalEmployees: 450,
  hiringPlans: '12 months',

  currentWorkforce: [
    { skill: 'JavaScript', availability: 82 },
    { skill: 'Python', availability: 64 },
    { skill: 'AWS', availability: 47 },
    { skill: 'Kubernetes', availability: 28 },
    { skill: 'AI/ML', availability: 35 },
  ],

  futureRequirement: [
    { skill: 'JavaScript', requirement: 88 },
    { skill: 'Python', requirement: 81 },
    { skill: 'AWS', requirement: 79 },
    { skill: 'Kubernetes', requirement: 68 },
    { skill: 'AI/ML', requirement: 67 },
  ],
}

export const mockAssessmentQuestions = [
  {
    id: 'Q001',
    question: 'What is the output of this JavaScript code?',
    options: ['undefined', 'null', 'Error', 'Object'],
    correct: 0,
    skill: 'JavaScript',
    difficulty: 'medium',
  },
  {
    id: 'Q002',
    question: 'Explain the difference between var, let, and const',
    options: ['No difference', 'Scope and hoisting differences', 'Only performance', 'None of these'],
    correct: 1,
    skill: 'JavaScript',
    difficulty: 'medium',
  },
]

export const mockLearningResources = [
  {
    id: 'LR-001',
    title: 'TypeScript Advanced Patterns',
    type: 'course',
    skill: 'TypeScript',
    difficulty: 'Advanced',
    duration: '4 weeks',
    provider: 'Udemy',
  },
  {
    id: 'LR-002',
    title: 'Docker in Production',
    type: 'course',
    skill: 'Docker',
    difficulty: 'Advanced',
    duration: '3 weeks',
    provider: 'Coursera',
  },
  {
    id: 'LR-003',
    title: 'AWS Solutions Architect Associate',
    type: 'certification',
    skill: 'AWS',
    difficulty: 'Advanced',
    duration: '8 weeks',
    provider: 'AWS',
  },
]

export const mockResearchPapers = [
  {
    id: 'RP-001',
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    date: '2017',
    topic: 'Deep Learning',
    summary: 'Introducing the Transformer architecture that powers modern LLMs',
  },
  {
    id: 'RP-002',
    title: 'Language Models are Few-Shot Learners',
    authors: 'Brown et al.',
    date: '2020',
    topic: 'AI/ML',
    summary: 'Demonstrating few-shot learning capabilities of large language models',
  },
]

export const mockInterviewQuestions = [
  {
    id: 'IQ-001',
    question: 'Design a URL shortener system',
    topic: 'System Design',
    difficulty: 'Hard',
    company: 'Google',
    frequency: 'High',
  },
  {
    id: 'IQ-002',
    question: 'Explain REST vs GraphQL',
    topic: 'Concepts',
    difficulty: 'Medium',
    company: 'Multiple',
    frequency: 'High',
  },
]
