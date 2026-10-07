import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class AdzunaCollector extends BaseCollector {
    private readonly BASE_URL;
    private readonly COUNTRY;
    constructor(config: CollectorConfig);
    collect(params?: {
        query?: string;
        location?: string;
        limit?: number;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeAdzunaJob;
}
//# sourceMappingURL=adzuna-collector.d.ts.map