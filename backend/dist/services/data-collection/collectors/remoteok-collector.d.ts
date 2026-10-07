import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class RemoteOKCollector extends BaseCollector {
    private readonly BASE_URL;
    constructor(config?: CollectorConfig);
    collect(params?: {
        tags?: string[];
        limit?: number;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeRemoteOKJob;
}
//# sourceMappingURL=remoteok-collector.d.ts.map