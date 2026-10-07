import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class RemotiveCollector extends BaseCollector {
    private readonly BASE_URL;
    constructor(config?: CollectorConfig);
    collect(params?: {
        category?: string;
        search?: string;
        limit?: number;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeRemotiveJob;
}
//# sourceMappingURL=remotive-collector.d.ts.map