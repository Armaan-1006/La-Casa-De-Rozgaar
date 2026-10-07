// ============================================================================
// ADZUNA API COLLECTOR
// Collects jobs from Adzuna (India-specific, free tier available)
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult, EmploymentType, RemoteType } from '../types.js';

interface AdzunaJob {
  id: string;
  created: string;
  title: string;
  location: {
    area: string[];
    display_name: string;
  };
  description: string;
  company: {
    display_name: string;
  };
  category: {
    label: string;
    tag: string;
  };
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  latitude?: number;
  longitude?: number;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
  mean?: number;
}

export class AdzunaCollector extends BaseCollector {
  private readonly BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
  private readonly COUNTRY = 'in'; // India

  constructor(config: CollectorConfig) {
    super('adzuna', 'api', config);
  }

  async collect(params: {
    query?: string;
    location?: string;
    limit?: number;
  } = {}): Promise<CollectorResult> {
    try {
      const {
        query = 'software developer',
        location = '',
        limit = 100,
      } = params;

      if (!this.config.apiKey || !this.config.apiSecret) {
        throw new Error('Adzuna API key and app ID not configured');
      }

      const jobs: RawJobData[] = [];
      let page = 1;
      const resultsPerPage = 50; // Adzuna max

      while (jobs.length < limit) {
        const url = `${this.BASE_URL}/${this.COUNTRY}/search/${page}`;
        const searchParams = new URLSearchParams({
          app_id: this.config.apiKey, // Adzuna uses app_id
          app_key: this.config.apiSecret, // and app_key
          results_per_page: resultsPerPage.toString(),
          what: query,
          ...(location && { where: location }),
          sort_by: 'date',
        });

        const fullUrl = `${url}?${searchParams.toString()}`;
        const response = await this.fetchWithRetry(fullUrl);
        const data = (await response.json()) as AdzunaResponse;

        if (!data.results || data.results.length === 0) {
          break;
        }

        for (const job of data.results) {
          const normalized = this.normalizeAdzunaJob(job);
          if (this.validateJobData(normalized)) {
            jobs.push(normalized);
          }
        }

        if (data.results.length < resultsPerPage || jobs.length >= limit) {
          break;
        }

        page++;
        await this.sleep(1000); // Small delay between pages
      }

      return {
        success: true,
        source: this.source,
        jobs: jobs.slice(0, limit),
        totalCount: jobs.length,
        metadata: { query, location, pages: page },
      };
    } catch (error: any) {
      console.error('Adzuna collection error:', error);
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
      return result.success && result.jobs.length > 0;
    } catch {
      return false;
    }
  }

  private normalizeAdzunaJob(job: AdzunaJob): RawJobData {
    // Parse location
    const locationDisplay = job.location.display_name;
    const locationParts = locationDisplay.split(',').map(p => p.trim());
    const city = locationParts[0];
    const state = locationParts[1];

    // Determine employment type
    let employmentType: EmploymentType | undefined;
    const contractType = (job.contract_type || '').toLowerCase();
    if (contractType.includes('permanent') || contractType.includes('full')) {
      employmentType = 'FULL_TIME';
    } else if (contractType.includes('contract')) {
      employmentType = 'CONTRACT';
    } else if (contractType.includes('part')) {
      employmentType = 'PART_TIME';
    }

    // Detect remote from description
    const descLower = job.description.toLowerCase();
    let remoteType: RemoteType | undefined;
    if (descLower.includes('remote') || descLower.includes('work from home')) {
      remoteType = 'REMOTE';
    } else if (descLower.includes('hybrid')) {
      remoteType = 'HYBRID';
    } else {
      remoteType = 'ONSITE';
    }

    return {
      source: 'adzuna',
      sourceId: job.id,
      sourceUrl: job.redirect_url,

      title: job.title,
      company: job.company.display_name,
      location: locationDisplay,
      city,
      state,
      country: 'India',

      description: job.description,

      employmentType,
      remoteType,

      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: 'INR',

      category: job.category.label,
      applicationUrl: job.redirect_url,

      postedAt: job.created,

      rawData: job,
    };
  }
}
