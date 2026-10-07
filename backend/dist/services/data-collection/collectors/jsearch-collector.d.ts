import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class JSearchCollector extends BaseCollector {
    private readonly BASE_URL;
    constructor(config: CollectorConfig);
    collect(params?: {
        query?: string;
        location?: string;
        country?: string;
        remote?: boolean;
        limit?: number;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeJSearchJob;
}
//# sourceMappingURL=jsearch-collector.d.ts.map