// ============================================================================
// REMOTEOK COLLECTOR
// Collects remote jobs from RemoteOK JSON API
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult, EmploymentType } from '../types.js';

interface RemoteOKJob {
  id: string;
  slug: string;
  epoch: number;
  date: string;
  company: string;
  company_logo?: string;
  position: string;
  tags: string[];
  logo?: string;
  description: string;
  location: string;
  apply_url: string;
  url: string;
  salary_min?: number;
  salary_max?: number;
  [key: string]: any;
}

export class RemoteOKCollector extends BaseCollector {
  private readonly BASE_URL = 'https://remoteok.com/api';

  constructor(config: CollectorConfig = {}) {
    super('remoteok', 'api', {
      ...config,
      rateLimitPerMinute: 20, // RemoteOK rate limit
    });
  }

  async collect(params: {
    tags?: string[];
    limit?: number;
  } = {}): Promise<CollectorResult> {
    try {
      const { tags, limit = 100 } = params;

      const url = this.BASE_URL;
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'La-Casa-De-Rozgaar-Job-Aggregator/1.0',
        },
      });

      const data = (await response.json()) as RemoteOKJob[];

      // First item is usually metadata, skip it
      const jobData = data.slice(1);

      // Filter by tags if specified
      let filteredJobs = jobData;
      if (tags && tags.length > 0) {
        filteredJobs = jobData.filter(job => {
          const jobTags = (job.tags || []).map(t => t.toLowerCase());
          return tags.some(tag => jobTags.includes(tag.toLowerCase()));
        });
      }

      // Filter for India-related or remote jobs
      const relevantJobs = filteredJobs.filter(job => {
        const location = (job.location || '').toLowerCase();
        const isRemote = location.includes('anywhere') || location.includes('remote');
        const isIndia = location.includes('india');
        return isRemote || isIndia;
      });

      const jobs: RawJobData[] = relevantJobs
        .slice(0, limit)
        .map(job => this.normalizeRemoteOKJob(job))
        .filter(job => this.validateJobData(job));

      return {
        success: true,
        source: this.source,
        jobs,
        totalCount: jobs.length,
        metadata: { tags, totalAvailable: jobData.length, filtered: relevantJobs.length },
      };
    } catch (error: any) {
      console.error('RemoteOK collection error:', error);
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
      const result = await this.collect({ limit: 1 });
      return result.success && result.jobs.length > 0;
    } catch {
      return false;
    }
  }

  private normalizeRemoteOKJob(job: RemoteOKJob): RawJobData {
    // Parse tags into skills
    const skills = (job.tags || [])
      .filter(tag => !['remote', 'full-time', 'contract'].includes(tag.toLowerCase()))
      .slice(0, 10); // Limit to 10 most relevant

    // Determine employment type from tags
    let employmentType: EmploymentType | undefined;
    const tagString = (job.tags || []).join(' ').toLowerCase();
    if (tagString.includes('full-time') || tagString.includes('fulltime')) {
      employmentType = 'FULL_TIME';
    } else if (tagString.includes('contract')) {
      employmentType = 'CONTRACT';
    } else if (tagString.includes('part-time')) {
      employmentType = 'PART_TIME';
    }

    // Parse location
    const location = job.location || 'Remote';
    let city: string | undefined;
    let state: string | undefined;
    let country = 'Remote';

    if (location.toLowerCase().includes('india')) {
      country = 'India';
      const parts = location.split(',').map(p => p.trim());
      if (parts.length > 1) {
        city = parts[0];
        state = parts[1];
      }
    }

    // Convert epoch to ISO date
    const postedAt = job.epoch 
      ? new Date(job.epoch * 1000).toISOString() 
      : job.date;

    return {
      source: 'remoteok',
      sourceId: job.id || job.slug,
      sourceUrl: job.url,

      title: job.position,
      company: job.company,
      location,
      city,
      state,
      country,

      description: job.description,

      employmentType,
      remoteType: 'REMOTE', // All RemoteOK jobs are remote

      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: 'USD', // RemoteOK typically shows USD

      skills,

      applicationUrl: job.apply_url || job.url,

      postedAt,

      rawData: job,
    };
  }
}
