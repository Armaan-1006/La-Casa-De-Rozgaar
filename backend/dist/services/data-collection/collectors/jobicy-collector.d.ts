import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class JobicyCollector extends BaseCollector {
    private readonly BASE_URL;
    constructor(config?: CollectorConfig);
    collect(params?: {
        industry?: string;
        tag?: string;
        count?: number;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeJobicyJob;
}
//# sourceMappingURL=jobicy-collector.d.ts.map