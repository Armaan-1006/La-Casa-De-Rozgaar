import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export declare class GitHubCollector extends BaseCollector {
    private readonly BASE_URL;
    constructor(config?: CollectorConfig);
    collect(params?: {
        description?: string;
        location?: string;
        fullTime?: boolean;
        limit?: number;
    }): Promise<CollectorResult>;
    testConnection(): Promise<boolean>;
    private normalizeGitHubJob;
}
//# sourceMappingURL=github-collector.d.ts.map