// ============================================================================
// ARBEITNOW API COLLECTOR
// High-yield developer & tech jobs with zero authentication required
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult, EmploymentType, RemoteType } from '../types.js';

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags?: string[];
  job_types?: string[];
  location: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
  links: { next?: string };
}

export class ArbeitnowCollector extends BaseCollector {
  private readonly BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

  constructor(config: CollectorConfig = {}) {
    super('custom' as any, 'api', config);
  }

  async collect(params: {
    limit?: number;
    remoteOnly?: boolean;
  } = {}): Promise<CollectorResult> {
    try {
      const { limit = 100, remoteOnly = false } = params;
      const response = await this.fetchWithRetry(this.BASE_URL);
      const json = (await response.json()) as ArbeitnowResponse;

      if (!json.data || json.data.length === 0) {
        return {
          success: true,
          source: 'arbeitnow',
          jobs: [],
          totalCount: 0,
        };
      }

      const jobs: RawJobData[] = [];
      for (const item of json.data) {
        if (remoteOnly && !item.remote) continue;

        const normalized = this.normalizeArbeitnowJob(item);
        if (this.validateJobData(normalized)) {
          jobs.push(normalized);
        }

        if (jobs.length >= limit) break;
      }

      return {
        success: true,
        source: 'custom' as any,
        jobs,
        totalCount: jobs.length,
        metadata: { provider: 'arbeitnow' },
      };
    } catch (error: any) {
      console.error('Arbeitnow collection error:', error);
      return {
        success: false,
        source: 'custom' as any,
        jobs: [],
        totalCount: 0,
        errorMessage: error.message,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.collect({ limit: 1 });
      return res.success && res.jobs.length > 0;
    } catch {
      return false;
    }
  }

  private normalizeArbeitnowJob(item: ArbeitnowJob): RawJobData {
    let employmentType: EmploymentType = 'FULL_TIME';
    const typeStr = (item.job_types || []).join(' ').toLowerCase();
    if (typeStr.includes('part')) employmentType = 'PART_TIME';
    if (typeStr.includes('contract')) employmentType = 'CONTRACT';
    if (typeStr.includes('intern')) employmentType = 'INTERNSHIP';

    const isIndia = /india|bangalore|bengaluru|mumbai|delhi|hyderabad|pune/i.test(item.location || '');
    const remoteType: RemoteType = item.remote ? 'REMOTE' : (isIndia ? 'HYBRID' : 'ONSITE');

    return {
      source: 'custom' as any,
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
