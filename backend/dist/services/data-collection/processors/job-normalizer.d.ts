import { RawJobData, NormalizerResult } from '../types.js';
export declare class JobNormalizer {
    /**
     * Normalize raw job data into standardized format
     */
    normalize(raw: RawJobData): NormalizerResult;
    /**
     * Normalize job title
     */
    private normalizeTitle;
    /**
     * Normalize company name
     */
    private normalizeCompany;
    /**
     * Normalize location data
     */
    private normalizeLocation;
    /**
     * Normalize employment type
     */
    private normalizeEmploymentType;
    /**
     * Normalize remote type
     */
    private normalizeRemoteType;
    /**
     * Normalize salary data
     */
    private normalizeSalary;
    /**
     * Normalize experience requirements
     */
    private normalizeExperience;
    /**
     * Normalize skill names
     */
    private normalizeSkills;
    /**
     * Normalize individual skill name
     */
    private normalizeSkillName;
    /**
     * Capitalize skill name properly
     */
    private capitalizeSkill;
    /**
     * Clean text content
     */
    private cleanText;
    /**
     * Normalize date string
     */
    private normalizeDate;
}
//# sourceMappingURL=job-normalizer.d.ts.map