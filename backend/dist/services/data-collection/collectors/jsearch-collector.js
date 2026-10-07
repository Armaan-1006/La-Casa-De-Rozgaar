// ============================================================================
// JSEARCH API COLLECTOR (via RapidAPI)
// Free tier: 2,500 requests/month
// ============================================================================
import { BaseCollector } from './base-collector.js';
export class JSearchCollector extends BaseCollector {
    BASE_URL = 'https://jsearch.p.rapidapi.com/search-v2';
    constructor(config) {
        super('jsearch', 'api', config);
    }
    async collect(params = {}) {
        try {
            const { query = 'software developer jobs', country = 'us', limit = 50, } = params;
            if (!this.config.apiKey) {
                throw new Error('JSearch/RapidAPI key not configured');
            }
            const jobs = [];
            let page = 1;
            while (jobs.length < limit && page <= 3) {
                const url = `${this.BASE_URL}?query=${encodeURIComponent(query)}&num_pages=1&country=${encodeURIComponent(country)}&date_posted=all`;
                const response = await this.fetchWithRetry(url, {
                    headers: {
                        'X-RapidAPI-Key': this.config.apiKey,
                        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                    },
                });
                const data = await response.json();
                const rawList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.jobs) ? data.jobs : []));
                if (!rawList || rawList.length === 0) {
                    break;
                }
                for (const job of rawList) {
                    const normalized = this.normalizeJSearchJob(job);
                    if (this.validateJobData(normalized)) {
                        jobs.push(normalized);
                    }
                }
                if (jobs.length >= limit) {
                    break;
                }
                page++;
                await this.sleep(1500); // Respect rate limit
            }
            return {
                success: true,
                source: 'jsearch',
                jobs: jobs.slice(0, limit),
                totalCount: jobs.length,
                metadata: { query, country, pages: page },
            };
        }
        catch (error) {
            console.error('JSearch collection error:', error);
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
    normalizeJSearchJob(job) {
        // Determine employment type
        let employmentType;
        const empType = (job.job_employment_type || '').toUpperCase();
        if (empType.includes('FULLTIME') || empType.includes('FULL')) {
            employmentType = 'FULL_TIME';
        }
        else if (empType.includes('PARTTIME') || empType.includes('PART')) {
            employmentType = 'PART_TIME';
        }
        else if (empType.includes('CONTRACT')) {
            employmentType = 'CONTRACT';
        }
        else if (empType.includes('INTERN')) {
            employmentType = 'INTERNSHIP';
        }
        // Remote type
        const remoteType = job.job_is_remote ? 'REMOTE' : 'ONSITE';
        // Experience
        let experienceMin;
        let experienceMax;
        if (job.job_required_experience?.required_experience_in_months) {
            const months = job.job_required_experience.required_experience_in_months;
            experienceMin = Math.floor(months / 12);
            experienceMax = Math.ceil(months / 12);
        }
        // Build description from highlights if available
        let fullDescription = job.job_description;
        if (job.job_highlights) {
            const sections = [];
            if (job.job_highlights.Responsibilities) {
                sections.push('Responsibilities:\n' + job.job_highlights.Responsibilities.join('\n'));
            }
            if (job.job_highlights.Qualifications) {
                sections.push('Qualifications:\n' + job.job_highlights.Qualifications.join('\n'));
            }
            if (job.job_highlights.Benefits) {
                sections.push('Benefits:\n' + job.job_highlights.Benefits.join('\n'));
            }
            if (sections.length > 0) {
                fullDescription = fullDescription + '\n\n' + sections.join('\n\n');
            }
        }
        return {
            source: 'jsearch',
            sourceId: job.job_id,
            sourceUrl: job.job_apply_link,
            title: job.job_title,
            company: job.employer_name,
            location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', '),
            city: job.job_city,
            state: job.job_state,
            country: job.job_country,
            description: fullDescription,
            benefits: job.job_benefits?.join(', '),
            employmentType,
            remoteType,
            experienceMin,
            experienceMax,
            salaryMin: job.job_min_salary,
            salaryMax: job.job_max_salary,
            salaryCurrency: job.job_salary_currency || 'USD',
            salaryPeriod: job.job_salary_period ? job.job_salary_period.toUpperCase() : undefined,
            skills: job.job_required_skills,
            applicationUrl: job.job_apply_link,
            postedAt: job.job_posted_at_datetime_utc,
            expiresAt: job.job_offer_expiration_datetime_utc,
            rawData: job,
        };
    }
}
//# sourceMappingURL=jsearch-collector.js.map