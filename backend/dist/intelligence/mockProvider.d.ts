import type { IntelligenceProvider } from './provider.js';
import type { Job, JobSearchQuery, JobSearchResult, Skill, Role, RoleRequirements, MarketSkillSignal, MarketRoleSignal, CompensationQuery, CompensationData, ForecastQuery, ForecastData } from '../types.js';
export declare class MockIntelligenceProvider implements IntelligenceProvider {
    getJob(jobId: string): Promise<Job | null>;
    searchJobs(query: JobSearchQuery): Promise<JobSearchResult>;
    private mapRowToJob;
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
//# sourceMappingURL=mockProvider.d.ts.map