import { RawJobData, JobSource, CollectorResult, CollectorType } from '../types.js';
export interface CollectorConfig {
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
    rateLimitPerMinute?: number;
    rateLimitPerDay?: number;
    timeout?: number;
    maxRetries?: number;
    [key: string]: any;
}
export declare abstract class BaseCollector {
    protected source: JobSource;
    protected collectorType: CollectorType;
    protected config: CollectorConfig;
    protected requestCount: number;
    protected lastRequestTime: number;
    constructor(source: JobSource, collectorType: CollectorType, config?: CollectorConfig);
    /**
     * Main collection method - must be implemented by subclasses
     */
    abstract collect(params?: any): Promise<CollectorResult>;
    /**
     * Test connection/API key validity
     */
    abstract testConnection(): Promise<boolean>;
    /**
     * Rate limiting - ensure we don't exceed API limits
     */
    protected respectRateLimit(): Promise<void>;
    /**
     * Sleep utility
     */
    protected sleep(ms: number): Promise<void>;
    /**
     * HTTP request with retry logic
     */
    protected fetchWithRetry(url: string, options?: RequestInit, retries?: number): Promise<Response>;
    /**
     * Validate raw job data before returning
     */
    protected validateJobData(job: Partial<RawJobData>): job is RawJobData;
    /**
     * Get collector metadata
     */
    getMetadata(): {
        source: JobSource;
        collectorType: CollectorType;
        requestCount: number;
        config: {
            rateLimitPerMinute: number | undefined;
            timeout: number | undefined;
        };
    };
}
//# sourceMappingURL=base-collector.d.ts.map