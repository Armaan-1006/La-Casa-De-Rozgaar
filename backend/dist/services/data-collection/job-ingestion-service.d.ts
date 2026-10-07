import { IngestionLog, CollectorResult } from './types.js';
export declare class JobIngestionService {
    private normalizer;
    private deduplicator;
    private skillExtractor;
    constructor();
    /**
     * Ingest job postings from collector result
     */
    ingestJobs(result: CollectorResult): Promise<IngestionLog>;
    /**
     * Insert job posting into database
     */
    private insertJobPosting;
    /**
     * Get ingestion statistics
     */
    getIngestionStats(source?: string, days?: number): Promise<any>;
    /**
     * Get recent ingestion logs
     */
    getRecentLogs(limit?: number): Promise<IngestionLog[]>;
}
//# sourceMappingURL=job-ingestion-service.d.ts.map