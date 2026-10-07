// ============================================================================
// AUTOMATED DATA COLLECTION SCHEDULER
// Executes twice-daily high-yield syncs:
// 1. Midnight (00:00 UTC / 00:00 IST)
// 2. Post-Peak Office Update Hours (18:30 IST / 13:00 UTC)
// ============================================================================

import { AdzunaCollector } from './collectors/adzuna-collector.js';
import { RemotiveCollector } from './collectors/remotive-collector.js';
import { JobicyCollector } from './collectors/jobicy-collector.js';
import { RemoteOKCollector } from './collectors/remoteok-collector.js';
import { AtsCollector } from './collectors/ats-collector.js';
import { ArbeitnowCollector } from './collectors/arbeitnow-collector.js';
import { WeWorkRemotelyCollector } from './collectors/weworkremotely-collector.js';
import { JSearchCollector } from './collectors/jsearch-collector.js';
import { JobIngestionService } from './job-ingestion-service.js';
import { SkillDemandAggregator } from './aggregators/skill-demand-aggregator.js';

export class SchedulerService {
  private static instance: SchedulerService;
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastRunDate: string = '';

  private ingestionService = new JobIngestionService();
  private skillDemandAggregator = new SkillDemandAggregator();

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Start in-process automated cron monitor
   */
  public start(): void {
    if (this.timer) return;
    console.log('[SCHEDULER] Automated Data Ingestion Scheduler activated.');
    console.log('[SCHEDULER] Scheduled runs: 00:00 UTC (Midnight) and 13:00 UTC (18:30 IST Post-Peak Office Hours).');

    // Check every minute if it's time to run
    this.timer = setInterval(() => {
      this.checkAndExecuteSchedule();
    }, 60 * 1000);

    // Initial check on boot
    this.checkAndExecuteSchedule();
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[SCHEDULER] Scheduler stopped.');
    }
  }

  private async checkAndExecuteSchedule(): Promise<void> {
    const now = new Date();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const currentSlot = `${now.toISOString().split('T')[0]}_${hours}`;

    // Target UTC Hours:
    // 0 = 00:00 UTC (Midnight UTC)
    // 13 = 13:00 UTC (18:30 IST - End of office workday postings)
    // 18 = 18:30 UTC (00:00 IST - Midnight IST)
    const isTargetHour = (hours === 0 || hours === 13 || hours === 18) && minutes === 0;

    if (isTargetHour && this.lastRunDate !== currentSlot) {
      this.lastRunDate = currentSlot;
      console.log(`[SCHEDULER] Triggering scheduled data collection at ${now.toISOString()}...`);
      await this.runFullSync(`SCHEDULED_SLOT_${hours}UTC`);
    }
  }

  /**
   * Run complete multi-source collection and market analytics pipeline
   */
  public async runFullSync(triggerSource = 'MANUAL'): Promise<{
    success: boolean;
    totalCollected: number;
    totalNew: number;
    totalDuplicates: number;
    sources: any[];
    skillsAggregated: number;
  }> {
    if (this.isRunning) {
      console.warn('[SCHEDULER] Sync already in progress, skipping duplicate invocation.');
      return {
        success: false,
        totalCollected: 0,
        totalNew: 0,
        totalDuplicates: 0,
        sources: [],
        skillsAggregated: 0,
      };
    }

    this.isRunning = true;
    console.log(`[SCHEDULER] === Starting Full Job Ingestion Run (Trigger: ${triggerSource}) ===`);

    const sources: any[] = [];
    let totalCollected = 0;
    let totalNew = 0;
    let totalDuplicates = 0;

    try {
      // 1. Remotive (Developer & Engineering)
      try {
        const remotive = new RemotiveCollector();
        const res = await remotive.collect({ category: 'software-dev', limit: 50 });
        if (res.success && res.jobs.length > 0) {
          const log = await this.ingestionService.ingestJobs(res);
          sources.push({ source: 'remotive', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
          totalCollected += res.totalCount;
          totalNew += log.newJobs;
          totalDuplicates += log.duplicateJobs;
        }
      } catch (err: any) {
        console.error('[SCHEDULER] Remotive collector error:', err.message);
      }

      // 2. Jobicy (Remote Dev & Tech)
      try {
        const jobicy = new JobicyCollector();
        const res = await jobicy.collect({ industry: 'dev', count: 50 });
        if (res.success && res.jobs.length > 0) {
          const log = await this.ingestionService.ingestJobs(res);
          sources.push({ source: 'jobicy', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
          totalCollected += res.totalCount;
          totalNew += log.newJobs;
          totalDuplicates += log.duplicateJobs;
        }
      } catch (err: any) {
        console.error('[SCHEDULER] Jobicy collector error:', err.message);
      }

      // 3. Arbeitnow (300+ Tech & Remote Postings)
      try {
        const arbeitnow = new ArbeitnowCollector();
        const res = await arbeitnow.collect({ limit: 60 });
        if (res.success && res.jobs.length > 0) {
          const log = await this.ingestionService.ingestJobs(res);
          sources.push({ source: 'arbeitnow', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
          totalCollected += res.totalCount;
          totalNew += log.newJobs;
          totalDuplicates += log.duplicateJobs;
        }
      } catch (err: any) {
        console.error('[SCHEDULER] Arbeitnow collector error:', err.message);
      }

      // 4. WeWorkRemotely (Premier Programming Jobs)
      try {
        const wwr = new WeWorkRemotelyCollector();
        const res = await wwr.collect({ limit: 40 });
        if (res.success && res.jobs.length > 0) {
          const log = await this.ingestionService.ingestJobs(res);
          sources.push({ source: 'weworkremotely', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
          totalCollected += res.totalCount;
          totalNew += log.newJobs;
          totalDuplicates += log.duplicateJobs;
        }
      } catch (err: any) {
        console.error('[SCHEDULER] WeWorkRemotely collector error:', err.message);
      }

      // 5. Direct Company ATS Boards (Greenhouse, Lever, Ashby)
      try {
        const ats = new AtsCollector();
        const res = await ats.collect({ limitPerCompany: 10 });
        if (res.success && res.jobs.length > 0) {
          const log = await this.ingestionService.ingestJobs(res);
          sources.push({ source: 'ats_direct', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
          totalCollected += res.totalCount;
          totalNew += log.newJobs;
          totalDuplicates += log.duplicateJobs;
        }
      } catch (err: any) {
        console.error('[SCHEDULER] ATS collector error:', err.message);
      }

      // 6. RemoteOK (Global Remote Tech)
      try {
        const remoteok = new RemoteOKCollector();
        const res = await remoteok.collect({ limit: 40 });
        if (res.success && res.jobs.length > 0) {
          const log = await this.ingestionService.ingestJobs(res);
          sources.push({ source: 'remoteok', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
          totalCollected += res.totalCount;
          totalNew += log.newJobs;
          totalDuplicates += log.duplicateJobs;
        }
      } catch (err: any) {
        console.error('[SCHEDULER] RemoteOK collector error:', err.message);
      }

      // 7. Adzuna India (Major Domestic Indian Postings)
      const adzunaAppId = process.env.ADZUNA_APP_ID;
      const adzunaAppKey = process.env.ADZUNA_APP_KEY;
      if (adzunaAppId && adzunaAppKey) {
        try {
          const adzuna = new AdzunaCollector({ apiKey: adzunaAppId, apiSecret: adzunaAppKey });
          const res = await adzuna.collect({ query: 'software developer', limit: 40 });
          if (res.success && res.jobs.length > 0) {
            const log = await this.ingestionService.ingestJobs(res);
            sources.push({ source: 'adzuna', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
            totalCollected += res.totalCount;
            totalNew += log.newJobs;
            totalDuplicates += log.duplicateJobs;
          }
        } catch (err: any) {
          console.error('[SCHEDULER] Adzuna collector error:', err.message);
        }
      }

      // 8. JSearch (RapidAPI Multi-Search)
      const jsearchKey = process.env.JSEARCH_API_KEY;
      if (jsearchKey) {
        try {
          const jsearch = new JSearchCollector({ apiKey: jsearchKey });
          const res = await jsearch.collect({ query: 'developer jobs', limit: 30 });
          if (res.success && res.jobs.length > 0) {
            const log = await this.ingestionService.ingestJobs(res);
            sources.push({ source: 'jsearch', count: res.totalCount, new: log.newJobs, dup: log.duplicateJobs });
            totalCollected += res.totalCount;
            totalNew += log.newJobs;
            totalDuplicates += log.duplicateJobs;
          }
        } catch (err: any) {
          console.error('[SCHEDULER] JSearch collector error:', err.message);
        }
      }

      // Aggregate Skill Demand & Trends across all collected data
      console.log('[SCHEDULER] Aggregating skill demand and salary curves across database...');
      const demandTrends = await this.skillDemandAggregator.calculateSkillDemand({ daysBack: 30 });

      console.log(`[SCHEDULER] Sync Complete: ${totalNew} new jobs, ${totalDuplicates} duplicates, ${demandTrends.length} skills analyzed.`);

      return {
        success: true,
        totalCollected,
        totalNew,
        totalDuplicates,
        sources,
        skillsAggregated: demandTrends.length,
      };
    } finally {
      this.isRunning = false;
    }
  }
}
