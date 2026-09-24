import {
  mockCandidate,
  mockJobs,
  mockMarketData,
  mockRoleDossiers,
  mockForecastData,
  mockEmployer,
  mockLearningRoadmap,
  mockLearningResources,
  mockInterviewQuestions,
  mockResearchPapers,
  mockIntelligenceFeed,
  mockTalentVaultCandidates,
  mockAssessmentQuestions,
  JobListing,
  TalentCandidate,
  InterviewRecord,
  ResearchPaper
} from '../data/mockData'

const API_BASE = '/api/v1'
const TOKEN_KEY = 'lcdr_auth_token'
const USER_KEY = 'lcdr_auth_user'

interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    requestId?: string
  }
  meta?: Record<string, any>
}

class ApiService {
  private token: string | null = null
  private currentUser: any = null
  public isOnline: boolean | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY)
      const userStr = localStorage.getItem(USER_KEY)
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr)
        } catch {
          this.currentUser = null
        }
      }
    }
  }

  // ---- Token & Auth State ----
  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY)
    }
    return this.token
  }

  public setToken(token: string | null, user?: any): void {
    this.token = token
    this.currentUser = user || null
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
  }

  public getUser(): any {
    return this.currentUser
  }

  // Helper to ensure authenticated state (auto-login with demo candidate if no token)
  public async ensureAuth(): Promise<string | null> {
    if (this.getToken()) return this.token
    try {
      // Attempt auto-login with default demo account
      const res = await this.auth.login('rahul@example.com', 'password123')
      if (res && res.token) {
        return res.token
      }
    } catch {
      // offline or silent fail
    }
    return null
  }

  // ---- Core Request Method ----
  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    const token = this.getToken()
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      })

      this.isOnline = true
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        return {
          error: json.error || {
            code: `HTTP_${res.status}`,
            message: json.message || `Request failed with status ${res.status}`,
          },
          meta: json.meta,
        }
      }

      return json
    } catch (err: any) {
      this.isOnline = false
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: err?.message || 'Failed to connect to backend server',
        },
      }
    }
  }

  // =========================================================================
  // 1. AUTHENTICATION & USERS
  // =========================================================================
  public auth = {
    login: async (email: string, password: string) => {
      const res = await this.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (res.data?.token) {
        this.setToken(res.data.token, res.data.user || { email, role: res.data.role })
      }
      return res.data
    },

    register: async (userData: { email: string; password: string; name?: string; role?: string }) => {
      const res = await this.request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      if (res.data?.token) {
        this.setToken(res.data.token, res.data.user || { email: userData.email, role: res.data.role })
      }
      return res.data
    },

    me: async () => {
      const res = await this.request<any>('/auth/me')
      return res.data
    },

    logout: () => {
      this.setToken(null)
    },
  }

  // =========================================================================
  // 2. CANDIDATE PROFILE & SKILLS
  // =========================================================================
  public candidate = {
    getProfile: async () => {
      await this.ensureAuth()
      const res = await this.request<any>('/candidates/profile')
      if (res.data) {
        // Merge with rich UI format
        return {
          ...mockCandidate,
          ...res.data,
          name: res.data.name || mockCandidate.name,
          targetRole: (res.data.target_roles && res.data.target_roles[0]) || mockCandidate.targetRole,
          location: res.data.location || mockCandidate.location,
          experience: `${res.data.total_experience_years || 4} years`,
          skills: res.data.skills?.length
            ? res.data.skills.map((s: any) => ({
                name: s.skill_name || s.name,
                score: s.verified_score || s.assessment_score || s.self_reported_score || 7.0,
                market: 8.5,
                gap: Math.round(((s.verified_score || s.assessment_score || 7.0) - 8.5) * 10) / 10,
                tier: (s.verified_score || s.assessment_score || 7.0) >= 8 ? 'strength' : (s.verified_score || s.assessment_score || 7.0) >= 6 ? 'high' : 'critical'
              }))
            : mockCandidate.skills
        }
      }
      return mockCandidate
    },

    updateProfile: async (data: {
      name?: string
      headline?: string
      bio?: string
      location?: string
      targetRoles?: string[]
      preferredLocations?: string[]
      employmentPreferences?: string[]
      portfolioLinks?: string[]
    }) => {
      await this.ensureAuth()
      const res = await this.request<any>('/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return res.data || data
    },

    getSkills: async () => {
      await this.ensureAuth()
      const res = await this.request<any[]>('/candidates/skills')
      return res.data || mockCandidate.skills
    },

    addSkill: async (skillId: string, skillName: string, score: number) => {
      await this.ensureAuth()
      const res = await this.request<any>('/candidates/skills', {
        method: 'POST',
        body: JSON.stringify({ skillId, skillName, selfReportedScore: score }),
      })
      return res.data
    },
  }

  // =========================================================================
  // 3. ASSESSMENTS
  // =========================================================================
  public assessments = {
    list: async () => {
      await this.ensureAuth()
      const res = await this.request<any[]>('/assessments')
      return res.data || [
        {
          id: 'assessment-01',
          title: 'Full Stack Developer Assessment',
          description: 'Comprehensive evaluation of frontend, backend, system architecture & database design.',
          duration_minutes: 90,
          difficulty: 'INTERMEDIATE',
          question_count: mockAssessmentQuestions.length,
          skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Docker']
        }
      ]
    },

    getQuestions: async (assessmentId: string) => {
      await this.ensureAuth()
      const res = await this.request<any[]>(`/assessments/${assessmentId}/questions`)
      if (res.data && res.data.length > 0) {
        return res.data.map((q: any, idx: number) => ({
          id: q.id || `q-${idx + 1}`,
          title: q.text?.slice(0, 50) || `Question ${idx + 1}`,
          category: q.skill_ids?.[0] || 'Technical',
          difficulty: q.difficulty || 'Medium',
          points: q.points || 10,
          timeEstimate: '3 mins',
          code: q.text,
          description: q.text,
          options: q.options || [],
          tags: q.skill_ids || ['Frontend', 'Logic']
        }))
      }
      return mockAssessmentQuestions
    },

    startAttempt: async (assessmentId: string) => {
      await this.ensureAuth()
      const res = await this.request<any>(`/assessments/${assessmentId}/attempt`, {
        method: 'POST'
      })
      return res.data
    },

    submitAttempt: async (attemptId: string, answers: any[], proctoringLog?: any[]) => {
      await this.ensureAuth()
      const res = await this.request<any>(`/assessments/attempts/${attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, proctoringLog: proctoringLog || [] })
      })
      return res.data
    }
  }

  // =========================================================================
  // 4. JOBS & MATCHING ENGINE
  // =========================================================================
  public matching = {
    getRecommendedJobs: async (): Promise<JobListing[]> => {
      await this.ensureAuth()
      const res = await this.request<any[]>('/matching/jobs/recommended')
      if (res.data && res.data.length > 0) {
        return res.data.map((item: any, idx: number): JobListing => {
          const job = item.job || item
          const matchScore = item.matchScore || 85
          return {
            id: job.id || `JOB-LC-00${idx + 1}`,
            title: job.title || 'Senior Software Engineer',
            company: job.company || 'TechCorp India',
            companyTier: 'Enterprise Tech // Verified Partner',
            location: job.location || 'Bangalore, India',
            remote: job.location?.toLowerCase().includes('remote') ? 'Remote' : 'Hybrid (2 days remote)',
            type: job.employmentType || 'Full-time',
            salary: job.salary ? `₹${(job.salary.min / 100000).toFixed(0)}L - ₹${(job.salary.max / 100000).toFixed(0)}L` : '₹18L - ₹28L',
            category: matchScore >= 80 ? 'Immediate-Fit' : 'Growth-Fit',
            matchScore: matchScore,
            matchBreakdown: {
              skillMatch: Math.min(99, matchScore + 3),
              experienceMatch: Math.min(99, matchScore - 2),
              roleMatch: Math.min(99, matchScore + 1),
              locationMatch: 90,
            },
            requiredSkills: job.skills?.map((s: string) => s.replace('skill_', '').toUpperCase()) || ['REACT', 'NODE.JS', 'TYPESCRIPT'],
            preferredSkills: ['DOCKER', 'AWS', 'GRAPHQL'],
            description: job.description || 'Deliver high performance enterprise applications.',
            postedDate: job.postedAt || '2026-09-20',
            responsibilities: [
              'Design scalable microservices and real-time APIs',
              'Collaborate with cross-functional product and infrastructure teams',
              'Implement security protocols and zero-trust data flows'
            ],
            benefits: ['Competitive Equity', 'Health Coverage', 'Remote Workspace Stipend']
          }
        })
      }
      return mockJobs
    },

    getJobMatch: async (jobId: string) => {
      await this.ensureAuth()
      const res = await this.request<any>(`/matching/jobs/${jobId}`)
      return res.data
    },

    calculateSkillGaps: async (targetRoleId: string) => {
      await this.ensureAuth()
      const res = await this.request<any>('/skill-gaps/calculate', {
        method: 'POST',
        body: JSON.stringify({ targetRoleId })
      })
      return res.data
    }
  }

  // =========================================================================
  // 5. CAREER SIMULATION VAULT
  // =========================================================================
  public simulation = {
    run: async (targetRoleId: string, skillChanges: Array<{ skillId: string; targetScore: number }>) => {
      await this.ensureAuth()
      const res = await this.request<any>('/simulation', {
        method: 'POST',
        body: JSON.stringify({ targetRoleId, skillChanges })
      })
      return res.data
    }
  }

  // =========================================================================
  // 6. LEARNING & ROADMAP
  // =========================================================================
  public learning = {
    getRecommended: async () => {
      await this.ensureAuth()
      const res = await this.request<any[]>('/learning/recommended')
      if (res.data && res.data.length > 0) {
        return res.data
      }
      return mockLearningResources
    },

    getResources: async (filters: { skillId?: string; difficulty?: string } = {}) => {
      await this.ensureAuth()
      const params = new URLSearchParams()
      if (filters.skillId) params.append('skillId', filters.skillId)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      const res = await this.request<any[]>(`/learning/resources?${params.toString()}`)
      return res.data || mockLearningResources
    },

    getRoadmap: () => mockLearningRoadmap
  }

  // =========================================================================
  // 7. INTERVIEW INTELLIGENCE
  // =========================================================================
  public interviews = {
    getQuestions: async (filters: { company?: string; roleId?: string; type?: string; topic?: string } = {}): Promise<InterviewRecord[]> => {
      await this.ensureAuth()
      const params = new URLSearchParams()
      if (filters.company) params.append('company', filters.company)
      if (filters.roleId) params.append('roleId', filters.roleId)
      if (filters.type) params.append('type', filters.type)
      if (filters.topic) params.append('topic', filters.topic)
      const res = await this.request<any[]>(`/interviews/questions?${params.toString()}`)
      if (res.data && res.data.length > 0) {
        return res.data.map((q: any): InterviewRecord => ({
          id: q.id,
          role: q.role_id || 'Full Stack Engineer',
          company: q.company || 'TechCorp',
          difficulty: (q.difficulty?.toUpperCase() as any) || 'HARD',
          question: q.question,
          topic: (q.topic as any) || 'System Design',
          frequency: 'VERY HIGH',
          reportedDate: q.reported_at ? q.reported_at.slice(0, 7) : '2026-09',
          verifiedStatus: q.source === 'REPORTED' ? 'COMMUNITY REPORTED' : 'OFFICIAL VERIFIED',
          tips: 'Demonstrate scalability tradeoffs and edge case handling.',
          expectedKeyPoints: [q.topic || 'System Design', 'Scalability', 'Error Handling']
        }))
      }
      return mockInterviewQuestions
    },

    reportQuestion: async (data: { company: string; roleId: string; question: string; topic: string; difficulty?: string; type?: string }) => {
      await this.ensureAuth()
      const res = await this.request<any>('/interviews/questions', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return res.data
    },

    getPreparation: async (roleId: string, company?: string) => {
      await this.ensureAuth()
      const params = new URLSearchParams({ roleId })
      if (company) params.append('company', company)
      const res = await this.request<any>(`/interviews/preparation?${params.toString()}`)
      return res.data
    }
  }

  // =========================================================================
  // 8. RESEARCH & MARKET INTELLIGENCE
  // =========================================================================
  public research = {
    getItems: async (filters: { type?: string; topic?: string; industry?: string } = {}): Promise<ResearchPaper[]> => {
      await this.ensureAuth()
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.topic) params.append('topic', filters.topic)
      if (filters.industry) params.append('industry', filters.industry)
      const res = await this.request<any[]>(`/research?${params.toString()}`)
      if (res.data && res.data.length > 0) {
        return res.data.map((item: any): ResearchPaper => ({
          id: item.id,
          title: item.title,
          authors: item.metadata?.authors || 'Intelligence Research Core',
          date: item.published_at ? item.published_at.slice(0, 7) : '2026-09',
          topic: item.topic || 'Emerging Systems',
          arxivId: item.metadata?.arxivId || 'arXiv:2609.0001',
          impactScore: '98.5 // CRITICAL',
          summary: item.summary || item.content?.slice(0, 200) || 'Foundational distributed research and enterprise benchmarking.',
          takeaways: item.tags || ['Enterprise Scaling', 'Microservices', 'Zero-Trust Protocol'],
          link: item.source_url || 'https://arxiv.org'
        }))
      }
      return mockResearchPapers
    },

    getMarketData: () => mockMarketData,
    getRoleDossiers: () => mockRoleDossiers,
    getForecastData: () => mockForecastData,
    getIntelligenceFeed: () => mockIntelligenceFeed
  }

  // =========================================================================
  // 9. TALENT VAULT & EMPLOYER INTELLIGENCE
  // =========================================================================
  public talent = {
    search: async (criteria: { skills?: string[]; roleId?: string; location?: string; minExperience?: number; maxExperience?: number }): Promise<TalentCandidate[]> => {
      await this.ensureAuth()
      const res = await this.request<any[]>('/talent/search', {
        method: 'POST',
        body: JSON.stringify(criteria)
      })
      if (res.data && res.data.length > 0) {
        return res.data.map((c: any, idx: number): TalentCandidate => ({
          id: c.id || `TAL-00${idx + 1}`,
          codeName: `OPERATIVE-${(c.name || 'ANON').toUpperCase().replace(/\s+/g, '-')}`,
          name: c.name || 'Candidate',
          targetRole: c.headline || 'Full Stack Developer',
          experience: `${c.total_experience_years || 3.5} yrs`,
          location: c.location || 'Bangalore (Open Remote)',
          readinessScore: 88,
          verifiedStatus: 'VERIFIED // LEVEL 4',
          expectedSalary: '₹1.8M - ₹2.4M',
          availability: 'Immediate (15 Days)',
          topSkills: [
            { name: 'JavaScript', score: 8.4 },
            { name: 'React', score: 8.0 },
            { name: 'Node.js', score: 7.5 },
            { name: 'SQL', score: 8.0 }
          ],
          highlights: 'Strong full-stack architecture background verified through high benchmark scoring.'
        }))
      }
      return mockTalentVaultCandidates
    },

    getEmployerData: () => mockEmployer,

    analyzeWorkforceGaps: async (profileId: string) => {
      await this.ensureAuth()
      const res = await this.request<any>('/workforce/gaps/analyze', {
        method: 'POST',
        body: JSON.stringify({ profileId })
      })
      return res.data
    },

    getWorkforceRecommendation: async (params: { roleId: string; gapSkills: string[]; timelineMonths: number; budget: number }) => {
      await this.ensureAuth()
      const res = await this.request<any>('/workforce/gaps/recommendation', {
        method: 'POST',
        body: JSON.stringify(params)
      })
      return res.data
    }
  }

  // =========================================================================
  // 10. COMPENSATION & FORECASTS
  // =========================================================================
  public compensation = {
    get: async (roleId: string, location?: string, experienceYears?: number) => {
      await this.ensureAuth()
      const params = new URLSearchParams({ roleId })
      if (location) params.append('location', location)
      if (experienceYears !== undefined) params.append('experienceYears', experienceYears.toString())
      const res = await this.request<any>(`/compensation?${params.toString()}`)
      return res.data
    },

    getForecast: async (roleId?: string, skillId?: string, horizon: string = '12m') => {
      await this.ensureAuth()
      const params = new URLSearchParams({ horizon })
      if (roleId) params.append('roleId', roleId)
      if (skillId) params.append('skillId', skillId)
      const res = await this.request<any>(`/compensation/forecast?${params.toString()}`)
      return res.data
    }
  }

  // =========================================================================
  // 11. NOTIFICATIONS
  // =========================================================================
  public notifications = {
    list: async (unreadOnly: boolean = false) => {
      await this.ensureAuth()
      const res = await this.request<any[]>(`/notifications?unread=${unreadOnly}`)
      return res.data || []
    },

    markRead: async (id: string) => {
      await this.ensureAuth()
      const res = await this.request<any>(`/notifications/${id}/read`, { method: 'PUT' })
      return res.data
    },

    markAllRead: async () => {
      await this.ensureAuth()
      const res = await this.request<any>('/notifications/read-all', { method: 'PUT' })
      return res.data
    },

    delete: async (id: string) => {
      await this.ensureAuth()
      const res = await this.request<any>(`/notifications/${id}`, { method: 'DELETE' })
      return res.data
    }
  }

  // =========================================================================
  // 12. HEALTH CHECK
  // =========================================================================
  public async checkHealth(): Promise<{ status: string; database?: string; intelligenceProvider?: string }> {
    try {
      const res = await fetch('/health')
      if (res.ok) {
        const data = await res.json()
        this.isOnline = true
        return data
      }
    } catch {
      // offline
    }
    this.isOnline = false
    return { status: 'offline' }
  }
}

export const api = new ApiService()
export default api
