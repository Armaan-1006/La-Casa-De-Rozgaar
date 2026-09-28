import type { Job, JobSearchQuery, JobSearchResult, Skill, Role, RoleRequirements, MarketSkillSignal, MarketRoleSignal, CompensationQuery, CompensationData, ForecastQuery, ForecastData } from '../types.js';
/**
 * Intelligence Provider Interface
 *
 * Abstraction for Module 1 (Intelligence & Data Platform).
 * Implementations:
 *   - MockIntelligenceProvider: development/testing
 *   - RemoteIntelligenceProvider: production (Module 1 API)
 */
export interface IntelligenceProvider {
    getJob(jobId: string): Promise<Job | null>;
    searchJobs(query: JobSearchQuery): Promise<JobSearchResult>;
    getSkill(skillId: string): Promise<Skill | null>;
    searchSkills(query: string): Promise<Skill[]>;
    getRole(roleId: string): Promise<Role | null>;
    getRoleRequirements(roleId: string): Promise<RoleRequirements | null>;
    searchRoles(query: string): Promise<Role[]>;
    getMarketSkillSignal(skillId: string): Promise<MarketSkillSignal | null>;
    getMarketRoleSignal(roleId: string): Promise<MarketRoleSignal | null>;
    getCompensation(query: CompensationQuery): Promise<CompensationData | null>;
    getForecast(query: ForecastQuery): Promise<ForecastData>;
}
//# sourceMappingURL=provider.d.ts.map