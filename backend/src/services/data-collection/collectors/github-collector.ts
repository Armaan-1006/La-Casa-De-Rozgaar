// ============================================================================
// GITHUB JOBS COLLECTOR
// Collects tech jobs from GitHub Jobs API
// Note: GitHub Jobs API was deprecated in May 2021
// This is a template - may need to use alternative like GitHub's careers page
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult } from '../types.js';

interface GitHubJob {
  id: string;
  type: string;
  url: string;
  created_at: string;
  company: string;
  company_url: string;
  location: string;
  title: string;
  description: string;
  how_to_apply: string;
  company_logo?: string;
}

export class GitHubCollector extends BaseCollector {
  private readonly BASE_URL = 'https://jobs.github.com/positions.json';

  constructor(config: CollectorConfig = {}) {
    super('github', 'api', config);
  }

  async collect(params: {
    description?: string;
    location?: string;
    fullTime?: boolean;
    limit?: number;
  } = {}): Promise<CollectorResult> {
    try {
      const {
        description = 'software developer',
        location = 'India',
        fullTime = true,
        limit = 50,
      } = params;

      const searchParams = new URLSearchParams({
        description,
        location,
        full_time: fullTime.toString(),
      });

      const url = `${this.BASE_URL}?${searchParams.toString()}`;
      const response = await this.fetchWithRetry(url);
      const data = (await response.json()) as GitHubJob[];

      const jobs: RawJobData[] = data
        .slice(0, limit)
        .map(job => this.normalizeGitHubJob(job))
        .filter(job => this.validateJobData(job));

      return {
        success: true,
        source: this.source,
        jobs,
        totalCount: jobs.length,
        metadata: { description, location },
      };
    } catch (error: any) {
      console.error('GitHub Jobs collection error:', error);
      
      // GitHub Jobs API is deprecated - return graceful failure
      return {
        success: false,
        source: this.source,
        jobs: [],
        totalCount: 0,
        errorMessage: 'GitHub Jobs API has been deprecated. Consider alternative sources.',
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

  private normalizeGitHubJob(job: GitHubJob): RawJobData {
    // Extract location components
    const locationParts = job.location.split(',').map(p => p.trim());
    const city = locationParts[0];
    const state = locationParts[1];
    const country = locationParts[locationParts.length - 1] || 'India';

    // Detect remote from location
    const remoteType = job.location.toLowerCase().includes('remote') 
      ? 'REMOTE' 
      : 'ONSITE';

    return {
      source: 'github',
      sourceId: job.id,
      sourceUrl: job.url,

      title: job.title,
      company: job.company,
      location: job.location,
      city,
      state,
      country,

      description: job.description,

      employmentType: job.type.toLowerCase().includes('full') ? 'FULL_TIME' : undefined,
      remoteType,

      applicationUrl: job.url,

      postedAt: job.created_at,

      rawData: job,
    };
  }
}
