import { SkillExtractionResult } from '../types.js';
export declare class SkillExtractor {
    private readonly SKILL_KEYWORDS;
    private readonly REQUIRED_PATTERNS;
    private readonly PREFERRED_PATTERNS;
    /**
     * Extract skills from job description
     */
    extractSkills(description: string, requirements?: string): SkillExtractionResult;
    /**
     * Extract skills by matching against known keywords
     */
    private extractByKeywords;
    /**
     * Extract skills using contextual patterns
     */
    private extractByContext;
    /**
     * Parse comma/and separated skill list
     */
    private parseSkillList;
    /**
     * Classify skills as required or preferred
     */
    private classifySkills;
    /**
     * Calculate extraction confidence (0-1)
     */
    private calculateConfidence;
    /**
     * Escape regex special characters
     */
    private escapeRegex;
    /**
     * Add custom skill to dictionary
     */
    addSkill(skill: string): void;
    /**
     * Get all known skills
     */
    getKnownSkills(): string[];
}
//# sourceMappingURL=skill-extractor.d.ts.map