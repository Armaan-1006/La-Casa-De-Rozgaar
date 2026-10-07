import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class WeWorkRemotelyCollector extends BaseCollector {
    private readonly FEED_URL;
    constructor(config?: CollectorConfig);
    collect(params?: {
        limit?: number;
    }): Promise<CollectorResult>;
    private parseRss;
    private normalizeWwrJob;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=weworkremotely-collector.d.ts.map