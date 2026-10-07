import { MarketSkillDemand } from '../types.js';
export declare class SkillDemandAggregator {
    /**
     * Calculate skill demand from recent job postings
     */
    calculateSkillDemand(params?: {
        daysBack?: number;
        calculationPeriod?: string;
        minSampleSize?: number;
    }): Promise<MarketSkillDemand[]>;
    /**
     * Calculate momentum from trend
     */
    private calculateMomentum;
    /**
     * Calculate urgency
     */
    private calculateUrgency;
    /**
     * Calculate data quality score
     */
    private calculateDataQuality;
    /**
     * Categorize skill
     */
    private categorizeSkill;
    /**
     * Generate skill ID from name
     */
    private generateSkillId;
    /**
     * Extract role from job title
     */
    private extractRole;
    /**
     * Save skill demands to database
     */
    private saveSkillDemands;
    /**
     * Get top demanded skills
     */
    getTopSkills(limit?: number): Promise<MarketSkillDemand[]>;
    /**
     * Get emerging skills
     */
    getEmergingSkills(limit?: number): Promise<MarketSkillDemand[]>;
    /**
     * Map database row to MarketSkillDemand
     */
    private mapDbToSkillDemand;
}
//# sourceMappingURL=skill-demand-aggregator.d.ts.map