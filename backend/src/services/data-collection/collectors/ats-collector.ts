// ============================================================================
// ATS DIRECT COLLECTOR (Greenhouse, Lever, Ashby)
// Collects live jobs directly from company job boards with zero auth required
// ============================================================================

import { BaseCollector, CollectorConfig } from './base-collector.js';
import { RawJobData, CollectorResult, EmploymentType, RemoteType } from '../types.js';

export interface CompanyBoard {
  name: string;
  slug: string;
  type: 'greenhouse' | 'lever' | 'ashby';
}

// Popular top-tier tech companies with active public ATS job boards
export const DEFAULT_TECH_BOARDS: CompanyBoard[] = [
  { name: 'Cloudflare', slug: 'cloudflare', type: 'greenhouse' },
  { name: 'Airbnb', slug: 'airbnb', type: 'greenhouse' },
  { name: 'Spotify', slug: 'spotify', type: 'lever' },
  { name: 'Notion', slug: 'notion', type: 'ashby' },
  { name: 'Figma', slug: 'figma', type: 'greenhouse' },
  { name: 'Stripe', slug: 'stripe', type: 'greenhouse' },
  { name: 'Automattic', slug: 'automattic', type: 'greenhouse' },
  { name: 'GitLab', slug: 'gitlab', type: 'greenhouse' },
  { name: 'Canva', slug: 'canva', type: 'greenhouse' },
  { name: 'Coinbase', slug: 'coinbase', type: 'greenhouse' },
  { name: 'Deliveroo', slug: 'deliveroo', type: 'greenhouse' },
  { name: 'DoorDash', slug: 'doordash', type: 'greenhouse' },
  { name: 'Reddit', slug: 'reddit', type: 'greenhouse' },
  { name: 'Ramp', slug: 'ramp', type: 'ashby' },
  { name: 'Vercel', slug: 'vercel', type: 'ashby' },
];

export class AtsCollector extends BaseCollector {
  constructor(config: CollectorConfig = {}) {
    super('custom' as any, 'api', config);
  }

  async collect(params: {
    boards?: CompanyBoard[];
    limitPerCompany?: number;
  } = {}): Promise<CollectorResult> {
    const boards = params.boards || DEFAULT_TECH_BOARDS;
    const limitPerCompany = params.limitPerCompany || 15;
    const allJobs: RawJobData[] = [];

    for (const board of boards) {
      try {
        let boardJobs: RawJobData[] = [];
        if (board.type === 'greenhouse') {
          boardJobs = await this.collectGreenhouse(board, limitPerCompany);
        } else if (board.type === 'lever') {
          boardJobs = await this.collectLever(board, limitPerCompany);
        } else if (board.type === 'ashby') {
          boardJobs = await this.collectAshby(board, limitPerCompany);
        }

        allJobs.push(...boardJobs);
      } catch (err: any) {
        console.warn(`Error collecting from ATS board ${board.name}:`, err.message);
      }
    }

    return {
      success: true,
      source: 'custom' as any,
      jobs: allJobs,
      totalCount: allJobs.length,
      metadata: { boardsChecked: boards.length },
    };
  }

  private async collectGreenhouse(board: CompanyBoard, limit: number): Promise<RawJobData[]> {
    const url = `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`;
    const res = await this.fetchWithRetry(url);
    if (!res.ok) return [];

    const data = (await res.json()) as any;
    const jobs = data?.jobs || [];
    const results: RawJobData[] = [];

    for (const job of jobs.slice(0, limit)) {
      const location = job.location?.name || 'Various / Remote';
      const isRemote = /remote|anywhere|wfh/i.test(location) || /remote|anywhere/i.test(job.title);
      const isIndia = /india|bangalore|bengaluru|mumbai|delhi|hyderabad|pune|gurugram|chennai|noida/i.test(location);

      const normalized: RawJobData = {
        source: 'ats',
        sourceId: `gh-${board.slug}-${job.id}`,
        sourceUrl: job.absolute_url,
        title: job.title,
        company: board.name,
        location,
        country: isIndia ? 'India' : (isRemote ? 'Worldwide' : 'Various'),
        description: job.content || '',
        skills: [],
        employmentType: 'FULL_TIME',
        remoteType: isRemote ? 'REMOTE' : (isIndia ? 'HYBRID' : 'ONSITE'),
        category: job.departments?.[0]?.name,
        applicationUrl: job.absolute_url,
        postedAt: job.updated_at || new Date().toISOString(),
        rawData: job,
      };

      if (this.validateJobData(normalized)) {
        results.push(normalized);
      }
    }

    return results;
  }

  private async collectLever(board: CompanyBoard, limit: number): Promise<RawJobData[]> {
    const url = `https://api.lever.co/v0/postings/${board.slug}?mode=json`;
    const res = await this.fetchWithRetry(url);
    if (!res.ok) return [];

    const data = (await res.json()) as any;
    if (!Array.isArray(data)) return [];

    const results: RawJobData[] = [];
    for (const job of data.slice(0, limit)) {
      const location = job.categories?.location || job.country || 'Remote';
      const isRemote = /remote/i.test(job.workplaceType || '') || /remote/i.test(location);
      const isIndia = /india|bangalore|bengaluru|mumbai|delhi|hyderabad|pune/i.test(location);

      const normalized: RawJobData = {
        source: 'ats',
        sourceId: `lever-${board.slug}-${job.id}`,
        sourceUrl: job.hostedUrl || job.applyUrl,
        title: job.text,
        company: board.name,
        location,
        country: isIndia ? 'India' : (isRemote ? 'Worldwide' : 'Various'),
        description: job.descriptionPlain || job.description || '',
        skills: job.categories?.commitment ? [job.categories.commitment] : [],
        employmentType: 'FULL_TIME',
        remoteType: isRemote ? 'REMOTE' : 'HYBRID',
        category: job.categories?.department || job.categories?.team,
        applicationUrl: job.applyUrl || job.hostedUrl,
        postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
        rawData: job,
      };

      if (this.validateJobData(normalized)) {
        results.push(normalized);
      }
    }

    return results;
  }

  private async collectAshby(board: CompanyBoard, limit: number): Promise<RawJobData[]> {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${board.slug}`;
    const res = await this.fetchWithRetry(url);
    if (!res.ok) return [];

    const data = (await res.json()) as any;
    const jobs = data?.jobs || [];
    const results: RawJobData[] = [];

    for (const job of jobs.slice(0, limit)) {
      const location = job.location || job.address?.postalAddress?.addressLocality || 'Remote';
      const isRemote = job.isRemote || /remote/i.test(location);
      const isIndia = /india|bangalore|bengaluru|mumbai|delhi/i.test(location);

      const normalized: RawJobData = {
        source: 'ats',
        sourceId: `ashby-${board.slug}-${job.id}`,
        sourceUrl: job.jobUrl || job.applyUrl,
        title: job.title,
        company: board.name,
        location,
        country: isIndia ? 'India' : (isRemote ? 'Worldwide' : 'Various'),
        description: job.descriptionHtml || job.descriptionPlain || '',
        skills: [],
        employmentType: 'FULL_TIME',
        remoteType: isRemote ? 'REMOTE' : 'HYBRID',
        category: job.department,
        applicationUrl: job.applyUrl || job.jobUrl,
        postedAt: job.publishedAt || new Date().toISOString(),
        rawData: job,
      };

      if (this.validateJobData(normalized)) {
        results.push(normalized);
      }
    }

    return results;
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.collect({ limitPerCompany: 1 });
      return result.success && result.jobs.length > 0;
    } catch {
      return false;
    }
  }
}
