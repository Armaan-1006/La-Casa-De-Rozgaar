import { config } from '../config.js';
/**
 * Remote Intelligence Provider
 * Connects to Module 1 API for production/integration use.
 */
export class RemoteIntelligenceProvider {
    baseUrl;
    apiKey;
    constructor() {
        this.baseUrl = config.module1.apiUrl;
        this.apiKey = config.module1.apiKey;
    }
    async request(path, options) {
        try {
            const headers = {
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
            const json = await res.json();
            return (json.data ?? json);
        }
        catch (err) {
            console.error(`[RemoteProvider] Error fetching ${path}:`, err);
            return null;
        }
    }
    async getJob(jobId) {
        return this.request(`/jobs/${jobId}`);
    }
    async searchJobs(query) {
        const params = new URLSearchParams();
        if (query.keywords)
            params.set('keywords', query.keywords);
        if (query.skills?.length)
            params.set('skills', query.skills.join(','));
        if (query.location)
            params.set('location', query.location);
        if (query.page)
            params.set('page', String(query.page));
        if (query.pageSize)
            params.set('pageSize', String(query.pageSize));
        const result = await this.request(`/jobs?${params}`);
        return result || { jobs: [], total: 0, page: 1, pageSize: 25 };
    }
    async getSkill(skillId) {
        return this.request(`/skills/${skillId}`);
    }
    async searchSkills(query) {
        const result = await this.request(`/skills?q=${encodeURIComponent(query)}`);
        return result || [];
    }
    async getRole(roleId) {
        return this.request(`/roles/${roleId}`);
    }
    async getRoleRequirements(roleId) {
        return this.request(`/roles/${roleId}/requirements`);
    }
    async searchRoles(query) {
        const result = await this.request(`/roles?q=${encodeURIComponent(query)}`);
        return result || [];
    }
    async getMarketSkillSignal(skillId) {
        return this.request(`/market/skills/${skillId}`);
    }
    async getMarketRoleSignal(roleId) {
        return this.request(`/market/roles/${roleId}`);
    }
    async getCompensation(query) {
        const params = new URLSearchParams();
        if (query.roleId)
            params.set('roleId', query.roleId);
        if (query.location)
            params.set('location', query.location);
        if (query.experienceYears)
            params.set('experienceYears', String(query.experienceYears));
        if (query.skillIds?.length)
            params.set('skillIds', query.skillIds.join(','));
        return this.request(`/compensation?${params}`);
    }
    async getForecast(query) {
        const result = await this.request('/forecasts', {
            method: 'POST',
            body: JSON.stringify(query),
        });
        return result || { horizon: query.horizon, predictions: [], generatedAt: new Date().toISOString(), modelVersion: 'unknown' };
    }
}
//# sourceMappingURL=remoteProvider.js.map