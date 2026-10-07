// ============================================================================
// ARBEITNOW API COLLECTOR
// High-yield developer & tech jobs with zero authentication required
// ============================================================================
import { BaseCollector } from './base-collector.js';
export class ArbeitnowCollector extends BaseCollector {
    BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';
    constructor(config = {}) {
        super('custom', 'api', config);
    }
    async collect(params = {}) {
        try {
            const { limit = 100, remoteOnly = false } = params;
            const response = await this.fetchWithRetry(this.BASE_URL);
            const json = (await response.json());
            if (!json.data || json.data.length === 0) {
                return {
                    success: true,
                    source: 'arbeitnow',
                    jobs: [],
                    totalCount: 0,
                };
            }
            const jobs = [];
            for (const item of json.data) {
                if (remoteOnly && !item.remote)
                    continue;
                const normalized = this.normalizeArbeitnowJob(item);
                if (this.validateJobData(normalized)) {
                    jobs.push(normalized);
                }
                if (jobs.length >= limit)
                    break;
            }
            return {
                success: true,
                source: 'custom',
                jobs,
                totalCount: jobs.length,
                metadata: { provider: 'arbeitnow' },
            };
        }
        catch (error) {
            console.error('Arbeitnow collection error:', error);
            return {
                success: false,
                source: 'custom',
                jobs: [],
                totalCount: 0,
                errorMessage: error.message,
            };
        }
    }
    async testConnection() {
        try {
            const res = await this.collect({ limit: 1 });
            return res.success && res.jobs.length > 0;
        }
        catch {
            return false;
        }
    }
    normalizeArbeitnowJob(item) {
        let employmentType = 'FULL_TIME';
        const typeStr = (item.job_types || []).join(' ').toLowerCase();
        if (typeStr.includes('part'))
            employmentType = 'PART_TIME';
        if (typeStr.includes('contract'))
            employmentType = 'CONTRACT';
        if (typeStr.includes('intern'))
            employmentType = 'INTERNSHIP';
        const isIndia = /india|bangalore|bengaluru|mumbai|delhi|hyderabad|pune/i.test(item.location || '');
        const remoteType = item.remote ? 'REMOTE' : (isIndia ? 'HYBRID' : 'ONSITE');
        return {
            source: 'custom',
            sourceId: `an-${item.slug}`,
            sourceUrl: item.url,
            title: item.title,
            company: item.company_name,
            location: item.location || (item.remote ? 'Remote' : 'Various'),
            country: isIndia ? 'India' : (item.remote ? 'Worldwide' : 'Various'),
            description: item.description,
            skills: item.tags || [],
            employmentType,
            remoteType,
            applicationUrl: item.url,
            postedAt: item.created_at ? new Date(item.created_at * 1000).toISOString() : new Date().toISOString(),
            rawData: item,
        };
    }
}
//# sourceMappingURL=arbeitnow-collector.js.map