// ============================================================================
// JSEARCH API COLLECTOR (via RapidAPI)
// Free tier: 2,500 requests/month
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult, EmploymentType, RemoteType } from '../types.js';

interface JSearchJob {
  job_id: string;
  employer_name: string;
  employer_logo?: string;
  employer_website?: string;
  employer_company_type?: string;
  job_publisher: string;
  job_employment_type: string;
  job_title: string;
  job_apply_link: string;
  job_description: string;
  job_is_remote: boolean;
  job_posted_at_timestamp: number;
  job_posted_at_datetime_utc: string;
  job_city?: string;
  job_state?: string;
  job_country: string;
  job_latitude?: number;
  job_longitude?: number;
  job_benefits?: string[];
  job_google_link: string;
  job_offer_expiration_datetime_utc?: string;
  job_offer_expiration_timestamp?: number;
  job_required_experience?: {
    no_experience_required: boolean;
    required_experience_in_months: number;
    experience_mentioned: boolean;
    experience_preferred: boolean;
  };
  job_required_skills?: string[];
  job_required_education?: {
    postgraduate_degree: boolean;
    professional_certification: boolean;
    high_school: boolean;
    associates_degree: boolean;
    bachelors_degree: boolean;
    degree_mentioned: boolean;
    degree_preferred: boolean;
    professional_certification_mentioned: boolean;
  };
  job_experience_in_place_of_education: boolean;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_salary_period?: string;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
  job_job_title?: string;
  job_posting_language: string;
  job_onet_soc?: string;
  job_onet_job_zone?: string;
}

interface JSearchResponse {
  status: string;
  request_id: string;
  parameters: {
    query: string;
    page: number;
    num_pages: number;
  };
  data: JSearchJob[];
}

export class JSearchCollector extends BaseCollector {
  private readonly BASE_URL = 'https://jsearch.p.rapidapi.com/search-v2';

  constructor(config: CollectorConfig) {
    super('jsearch', 'api', config);
  }

  async collect(params: {
    query?: string;
    location?: string;
    country?: string;
    remote?: boolean;
    limit?: number;
  } = {}): Promise<CollectorResult> {
    try {
      const {
        query = 'software developer jobs',
        country = 'us',
        limit = 50,
      } = params;

      if (!this.config.apiKey) {
        throw new Error('JSearch/RapidAPI key not configured');
      }

      const jobs: RawJobData[] = [];
      let page = 1;

      while (jobs.length < limit && page <= 3) {
        const url = `${this.BASE_URL}?query=${encodeURIComponent(query)}&num_pages=1&country=${encodeURIComponent(country)}&date_posted=all`;

        const response = await this.fetchWithRetry(url, {
          headers: {
            'X-RapidAPI-Key': this.config.apiKey,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          },
        });

        const data: any = await response.json();

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
    } catch (error: any) {
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

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.collect({ query: 'test', limit: 1 });
      return result.success;
    } catch {
      return false;
    }
  }

  private normalizeJSearchJob(job: JSearchJob): RawJobData {
    // Determine employment type
    let employmentType: EmploymentType | undefined;
    const empType = (job.job_employment_type || '').toUpperCase();
    if (empType.includes('FULLTIME') || empType.includes('FULL')) {
      employmentType = 'FULL_TIME';
    } else if (empType.includes('PARTTIME') || empType.includes('PART')) {
      employmentType = 'PART_TIME';
    } else if (empType.includes('CONTRACT')) {
      employmentType = 'CONTRACT';
    } else if (empType.includes('INTERN')) {
      employmentType = 'INTERNSHIP';
    }

    // Remote type
    const remoteType: RemoteType = job.job_is_remote ? 'REMOTE' : 'ONSITE';

    // Experience
    let experienceMin: number | undefined;
    let experienceMax: number | undefined;
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
      salaryPeriod: job.job_salary_period ? (job.job_salary_period.toUpperCase() as any) : undefined,

      skills: job.job_required_skills,

      applicationUrl: job.job_apply_link,

      postedAt: job.job_posted_at_datetime_utc,
      expiresAt: job.job_offer_expiration_datetime_utc,

      rawData: job,
    };
  }
}
