import { JobPosting } from '../types.js';
export declare class JobDeduplicator {
    /**
     * Find potential duplicate of a job
     */
    findDuplicate(job: Partial<JobPosting>): Promise<string | null>;
    /**
     * Calculate similarity between two jobs (0-1 score)
     */
    calculateSimilarity(job1: Partial<JobPosting>, job2: Partial<JobPosting>): number;
    /**
     * Simple string similarity using Jaccard index
     */
    private stringSimilarity;
    /**
     * Extract meaningful keywords from text
     */
    private extractKeywords;
    /**
     * Merge duplicate jobs (keep newer/better quality one)
     */
    mergeDuplicates(existingId: string, newJob: Partial<JobPosting>): Promise<void>;
}
//# sourceMappingURL=job-deduplicator.d.ts.map