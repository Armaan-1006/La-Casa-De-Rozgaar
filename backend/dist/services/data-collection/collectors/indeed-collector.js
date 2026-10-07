// ============================================================================
// INDEED API COLLECTOR
// Collects jobs from Indeed's official API
// ============================================================================
import { BaseCollector } from './base-collector.js';
export class IndeedCollector extends BaseCollector {
    BASE_URL = 'https://api.indeed.com/ads/apisearch';
    constructor(config) {
        super('indeed', 'api', config);
    }
    async collect(params = {}) {
        try {
            const { query = 'software developer', location = 'India', country = 'in', radius = 50, limit = 100, days = 7, } = params;
            if (!this.config.apiKey) {
                throw new Error('Indeed API key not configured');
            }
            const jobs = [];
            let page = 0;
            const pageSize = 25; // Indeed API limit per page
            while (jobs.length < limit) {
                const searchParams = new URLSearchParams({
                    publisher: this.config.apiKey,
                    q: query,
                    l: location,
                    co: country,
                    radius: radius.toString(),
                    format: 'json',
                    v: '2',
                    limit: pageSize.toString(),
                    start: (page * pageSize).toString(),
                    fromage: days.toString(), // Only jobs from last N days
                    sort: 'date',
                });
                const url = `${this.BASE_URL}?${searchParams.toString()}`;
                const response = await this.fetchWithRetry(url);
                const data = (await response.json());
                if (!data.results || data.results.length === 0) {
                    break; // No more results
                }
                for (const job of data.results) {
                    const normalized = this.normalizeIndeedJob(job);
                    if (this.validateJobData(normalized)) {
                        jobs.push(normalized);
                    }
                }
                page++;
                // Check if we've collected enough or reached end
                if (data.results.length < pageSize || jobs.length >= limit) {
                    break;
                }
                // Small delay between pages
                await this.sleep(1000);
            }
            return {
                success: true,
                source: this.source,
                jobs: jobs.slice(0, limit),
                totalCount: jobs.length,
                metadata: {
                    query,
                    location,
                    pages: page + 1,
                },
            };
        }
        catch (error) {
            console.error('Indeed collection error:', error);
            return {
                success: false,
                source: this.source,
                jobs: [],
                totalCount: 0,
                errorMessage: error.message,
            };
        }
    }
    async testConnection() {
        try {
            const result = await this.collect({ query: 'test', limit: 1 });
            return result.success;
        }
        catch {
            return false;
        }
    }
    normalizeIndeedJob(job) {
        // Parse salary if available
        let salaryMin;
        let salaryMax;
        let salaryCurrency = 'INR';
        if (job.salary) {
            const salaryMatch = job.salary.match(/₹?([\d,]+)\s*-\s*₹?([\d,]+)/);
            if (salaryMatch) {
                salaryMin = parseInt(salaryMatch[1].replace(/,/g, ''));
                salaryMax = parseInt(salaryMatch[2].replace(/,/g, ''));
            }
        }
        // Determine employment type from jobType array
        let employmentType;
        if (job.jobType && job.jobType.length > 0) {
            const typeMap = {
                'fulltime': 'FULL_TIME',
                'full-time': 'FULL_TIME',
                'parttime': 'PART_TIME',
                'part-time': 'PART_TIME',
                'contract': 'CONTRACT',
                'temporary': 'CONTRACT',
                'internship': 'INTERNSHIP',
            };
            const normalizedType = job.jobType[0].toLowerCase().replace(/\s/g, '');
            employmentType = typeMap[normalizedType];
        }
        // Detect remote type from location/description
        let remoteType;
        const locationLower = (job.location || '').toLowerCase();
        const descriptionLower = (job.description || '').toLowerCase();
        const combined = locationLower + ' ' + descriptionLower;
        if (combined.includes('remote') || combined.includes('work from home')) {
            remoteType = 'REMOTE';
        }
        else if (combined.includes('hybrid')) {
            remoteType = 'HYBRID';
        }
        else {
            remoteType = 'ONSITE';
        }
        return {
            source: 'indeed',
            sourceId: job.jobkey,
            sourceUrl: job.link,
            title: job.title,
            company: job.company,
            location: job.formattedLocation || job.location,
            city: job.city,
            state: job.state,
            country: job.country || 'India',
            description: job.description || job.snippet,
            employmentType,
            remoteType,
            salaryMin,
            salaryMax,
            salaryCurrency,
            applicationUrl: job.link,
            postedAt: job.date,
            expiresAt: job.expires,
            rawData: job,
        };
    }
}
//# sourceMappingURL=indeed-collector.js.map