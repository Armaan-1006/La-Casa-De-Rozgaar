import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class IndeedCollector extends BaseCollector {
    private readonly BASE_URL;
    constructor(config: CollectorConfig);
    collect(params?: {
        query?: string;
        location?: string;
        country?: string;
        radius?: number;
        limit?: number;
        days?: number;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeIndeedJob;
}
//# sourceMappingURL=indeed-collector.d.ts.map