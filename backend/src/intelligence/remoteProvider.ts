import type { IntelligenceProvider } from './provider.js';
import type {
  Job, JobSearchQuery, JobSearchResult,
  Skill, Role, RoleRequirements,
  MarketSkillSignal, MarketRoleSignal,
  CompensationQuery, CompensationData,
  ForecastQuery, ForecastData
} from '../types.js';
import { config } from '../config.js';

/**
 * Remote Intelligence Provider
 * Connects to Module 1 API for production/integration use.
 */
export class RemoteIntelligenceProvider implements IntelligenceProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.module1.apiUrl;
    this.apiKey = config.module1.apiKey;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
      if (!res.ok) {
        console.error(`[RemoteProvider] ${res.status} from ${path}`);
        return null;
      }
      const json = await res.json() as { data?: T };
      return (json.data ?? json) as T;
    } catch (err) {
      console.error(`[RemoteProvider] Error fetching ${path}:`, err);
      return null;
    }
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.request<Job>(`/jobs/${jobId}`);
  }

  async searchJobs(query: JobSearchQuery): Promise<JobSearchResult> {
    const params = new URLSearchParams();
    if (query.keywords) params.set('keywords', query.keywords);
    if (query.skills?.length) params.set('skills', query.skills.join(','));
    if (query.location) params.set('location', query.location);
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    const result = await this.request<JobSearchResult>(`/jobs?${params}`);
    return result || { jobs: [], total: 0, page: 1, pageSize: 25 };
  }

  async getSkill(skillId: string): Promise<Skill | null> {
    return this.request<Skill>(`/skills/${skillId}`);
  }

  async searchSkills(query: string): Promise<Skill[]> {
    const result = await this.request<Skill[]>(`/skills?q=${encodeURIComponent(query)}`);
    return result || [];
  }

  async getRole(roleId: string): Promise<Role | null> {
    return this.request<Role>(`/roles/${roleId}`);
  }

  async getRoleRequirements(roleId: string): Promise<RoleRequirements | null> {
    return this.request<RoleRequirements>(`/roles/${roleId}/requirements`);
  }

  async searchRoles(query: string): Promise<Role[]> {
    const result = await this.request<Role[]>(`/roles?q=${encodeURIComponent(query)}`);
    return result || [];
  }

  async getMarketSkillSignal(skillId: string): Promise<MarketSkillSignal | null> {
    return this.request<MarketSkillSignal>(`/market/skills/${skillId}`);
  }

  async getMarketRoleSignal(roleId: string): Promise<MarketRoleSignal | null> {
    return this.request<MarketRoleSignal>(`/market/roles/${roleId}`);
  }

  async getCompensation(query: CompensationQuery): Promise<CompensationData | null> {
    const params = new URLSearchParams();
    if (query.roleId) params.set('roleId', query.roleId);
    if (query.location) params.set('location', query.location);
    if (query.experienceYears) params.set('experienceYears', String(query.experienceYears));
    if (query.skillIds?.length) params.set('skillIds', query.skillIds.join(','));
    return this.request<CompensationData>(`/compensation?${params}`);
  }

  async getForecast(query: ForecastQuery): Promise<ForecastData> {
    const result = await this.request<ForecastData>('/forecasts', {
      method: 'POST',
      body: JSON.stringify(query),
    });
    return result || { horizon: query.horizon, predictions: [], generatedAt: new Date().toISOString(), modelVersion: 'unknown' };
  }
}
