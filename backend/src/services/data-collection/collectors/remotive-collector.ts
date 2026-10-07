// ============================================================================
// REMOTIVE API COLLECTOR
// Free public API - high-quality tech and developer jobs
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult, EmploymentType, RemoteType } from '../types.js';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo?: string;
  category: string;
  tags?: string[];
  job_type?: string;
  publication_date: string;
  candidate_required_location?: string;
  salary?: string;
  description: string;
  company_logo_url?: string;
}

interface RemotiveResponse {
  '0-legal-notice': string;
  'job-count': number;
  jobs: RemotiveJob[];
}

export class RemotiveCollector extends BaseCollector {
  private readonly BASE_URL = 'https://remotive.com/api/remote-jobs';

  constructor(config: CollectorConfig = {}) {
    super('remotive' as any, 'api', config);
  }

  async collect(params: {
    category?: string;
    search?: string;
    limit?: number;
  } = {}): Promise<CollectorResult> {
    try {
      const {
        category = 'software-dev',
        search = '',
        limit = 50,
      } = params;

      const searchParams = new URLSearchParams();
      if (category) searchParams.set('category', category);
      if (search) searchParams.set('search', search);
      if (limit) searchParams.set('limit', limit.toString());

      const url = `${this.BASE_URL}?${searchParams.toString()}`;
      const response = await this.fetchWithRetry(url);
      const data = (await response.json()) as RemotiveResponse;

      if (!data.jobs || data.jobs.length === 0) {
        return {
          success: true,
          source: 'remotive' as any,
          jobs: [],
          totalCount: 0,
        };
      }

      const jobs: RawJobData[] = [];
      for (const job of data.jobs.slice(0, limit)) {
        const normalized = this.normalizeRemotiveJob(job);
        if (this.validateJobData(normalized)) {
          jobs.push(normalized);
        }
      }

      return {
        success: true,
        source: 'remotive' as any,
        jobs,
        totalCount: jobs.length,
        metadata: { category, search },
      };
    } catch (error: any) {
      console.error('Remotive collection error:', error);
      return {
        success: false,
        source: 'remotive' as any,
        jobs: [],
        totalCount: 0,
        errorMessage: error.message,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.collect({ limit: 1 });
      return result.success && result.jobs.length > 0;
    } catch {
      return false;
    }
  }

  private normalizeRemotiveJob(job: RemotiveJob): RawJobData {
    // Parse employment type
    let employmentType: EmploymentType | undefined;
    const typeStr = (job.job_type || '').toLowerCase();
    if (typeStr.includes('full')) {
      employmentType = 'FULL_TIME';
    } else if (typeStr.includes('part')) {
      employmentType = 'PART_TIME';
    } else if (typeStr.includes('contract')) {
      employmentType = 'CONTRACT';
    } else if (typeStr.includes('freelance')) {
      employmentType = 'FREELANCE';
    }

    // Parse salary if available (e.g. "$100k - $120k" or "$80,000")
    let salaryMin: number | undefined;
    let salaryMax: number | undefined;
    let salaryCurrency = 'USD';

    if (job.salary) {
      const salaryClean = job.salary.replace(/,/g, '');
      const numbers = salaryClean.match(/\d+(?:\.\d+)?k?/gi);
      if (numbers && numbers.length > 0) {
        const parsed = numbers.map(n => {
          let val = parseFloat(n);
          if (n.toLowerCase().endsWith('k')) val *= 1000;
          return val;
        });
        salaryMin = parsed[0];
        salaryMax = parsed.length > 1 ? parsed[1] : parsed[0];
      }
      if (job.salary.includes('₹') || job.salary.toLowerCase().includes('inr')) {
        salaryCurrency = 'INR';
      } else if (job.salary.includes('€')) {
        salaryCurrency = 'EUR';
      }
    }

    return {
      source: 'remotive' as any,
      sourceId: job.id.toString(),
      sourceUrl: job.url,

      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Worldwide (Remote)',
      country: job.candidate_required_location?.includes('India') ? 'India' : 'Worldwide',

      description: job.description,
      skills: job.tags || [],

      employmentType,
      remoteType: 'REMOTE' as RemoteType,

      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod: 'YEARLY',

      category: job.category,
      applicationUrl: job.url,
      postedAt: job.publication_date,

      rawData: job,
    };
  }
}
