// ============================================================================
// JOBICY API COLLECTOR
// Free public API - tech, dev, and remote jobs
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult, EmploymentType, RemoteType } from '../types.js';

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobGeo?: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription: string;
  pubDate: string;
  annualSalaryMin?: number | string;
  annualSalaryMax?: number | string;
  salaryCurrency?: string;
}

interface JobicyResponse {
  apiVersion: string;
  jobCount: number;
  jobs: JobicyJob[];
}

export class JobicyCollector extends BaseCollector {
  private readonly BASE_URL = 'https://jobicy.com/api/v2/remote-jobs';

  constructor(config: CollectorConfig = {}) {
    super('jobicy' as any, 'api', config);
  }

  async collect(params: {
    industry?: string;
    tag?: string;
    count?: number;
  } = {}): Promise<CollectorResult> {
    try {
      const {
        industry = 'dev',
        tag = '',
        count = 50,
      } = params;

      const searchParams = new URLSearchParams();
      if (industry) searchParams.set('industry', industry);
      if (tag) searchParams.set('tag', tag);
      if (count) searchParams.set('count', Math.min(count, 50).toString());

      const url = `${this.BASE_URL}?${searchParams.toString()}`;
      const response = await this.fetchWithRetry(url);
      const data = (await response.json()) as JobicyResponse;

      if (!data.jobs || data.jobs.length === 0) {
        return {
          success: true,
          source: 'jobicy' as any,
          jobs: [],
          totalCount: 0,
        };
      }

      const jobs: RawJobData[] = [];
      for (const job of data.jobs) {
        const normalized = this.normalizeJobicyJob(job);
        if (this.validateJobData(normalized)) {
          jobs.push(normalized);
        }
      }

      return {
        success: true,
        source: 'jobicy' as any,
        jobs,
        totalCount: jobs.length,
        metadata: { industry, tag },
      };
    } catch (error: any) {
      console.error('Jobicy collection error:', error);
      return {
        success: false,
        source: 'jobicy' as any,
        jobs: [],
        totalCount: 0,
        errorMessage: error.message,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.collect({ count: 1 });
      return result.success && result.jobs.length > 0;
    } catch {
      return false;
    }
  }

  private normalizeJobicyJob(job: JobicyJob): RawJobData {
    let employmentType: EmploymentType | undefined;
    const types = (job.jobType || []).join(' ').toLowerCase();
    if (types.includes('full')) {
      employmentType = 'FULL_TIME';
    } else if (types.includes('part')) {
      employmentType = 'PART_TIME';
    } else if (types.includes('contract')) {
      employmentType = 'CONTRACT';
    } else if (types.includes('freelance')) {
      employmentType = 'FREELANCE';
    }

    const salaryMin = job.annualSalaryMin ? Number(job.annualSalaryMin) : undefined;
    const salaryMax = job.annualSalaryMax ? Number(job.annualSalaryMax) : undefined;

    return {
      source: 'jobicy' as any,
      sourceId: job.id.toString(),
      sourceUrl: job.url,

      title: job.jobTitle,
      company: job.companyName,
      location: job.jobGeo || 'Anywhere (Remote)',
      country: job.jobGeo?.includes('India') ? 'India' : 'Worldwide',

      description: job.jobDescription || job.jobExcerpt || '',
      skills: [...(job.jobIndustry || []), ...(job.jobType || [])],

      employmentType,
      remoteType: 'REMOTE' as RemoteType,

      salaryMin: salaryMin && !isNaN(salaryMin) ? salaryMin : undefined,
      salaryMax: salaryMax && !isNaN(salaryMax) ? salaryMax : undefined,
      salaryCurrency: job.salaryCurrency || 'USD',
      salaryPeriod: 'YEARLY',

      applicationUrl: job.url,
      postedAt: job.pubDate,

      rawData: job,
    };
  }
}
