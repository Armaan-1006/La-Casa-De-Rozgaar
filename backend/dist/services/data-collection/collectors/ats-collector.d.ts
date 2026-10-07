import { BaseCollector, CollectorConfig } from './base-collector.js';
import { CollectorResult } from '../types.js';
export interface CompanyBoard {
    name: string;
    slug: string;
    type: 'greenhouse' | 'lever' | 'ashby';
}
export declare const DEFAULT_TECH_BOARDS: CompanyBoard[];
export declare class AtsCollector extends BaseCollector {
    constructor(config?: CollectorConfig);
    collect(params?: {
        boards?: CompanyBoard[];
        limitPerCompany?: number;
    }): Promise<CollectorResult>;
    private collectGreenhouse;
    private collectLever;
    private collectAshby;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=ats-collector.d.ts.map