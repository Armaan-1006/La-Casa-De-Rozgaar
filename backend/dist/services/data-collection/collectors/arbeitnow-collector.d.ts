import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class ArbeitnowCollector extends BaseCollector {
    private readonly BASE_URL;
    constructor(config?: CollectorConfig);
    collect(params?: {
        limit?: number;
        remoteOnly?: boolean;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeArbeitnowJob;
}
//# sourceMappingURL=arbeitnow-collector.d.ts.map