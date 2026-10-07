// ============================================================================
// DATA COLLECTION ROUTES
// API endpoints for job collection and market intelligence
// ============================================================================

import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { IndeedCollector } from '../services/data-collection/collectors/indeed-collector.js';
import { RemoteOKCollector } from '../services/data-collection/collectors/remoteok-collector.js';
import { GitHubCollector } from '../services/data-collection/collectors/github-collector.js';
import { AdzunaCollector } from '../services/data-collection/collectors/adzuna-collector.js';
import { JSearchCollector } from '../services/data-collection/collectors/jsearch-collector.js';
import { RemotiveCollector } from '../services/data-collection/collectors/remotive-collector.js';
import { JobicyCollector } from '../services/data-collection/collectors/jobicy-collector.js';
import { AtsCollector } from '../services/data-collection/collectors/ats-collector.js';
import { JobIngestionService } from '../services/data-collection/job-ingestion-service.js';
import { SkillDemandAggregator } from '../services/data-collection/aggregators/skill-demand-aggregator.js';
import { getDb } from '../database/connection.js';

const router = Router();
const ingestionService = new JobIngestionService();
const skillDemandAggregator = new SkillDemandAggregator();

// ============================================================================
// MANUAL JOB COLLECTION TRIGGERS (Admin only)
// ============================================================================

/**
 * POST /data-collection/collect/remotive
 * Trigger Remotive job collection (free public API)
 */
router.post('/collect/remotive', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { category, search, limit } = req.body;
    const collector = new RemotiveCollector();
    const result = await collector.collect({ category, search, limit });

    if (!result.success) {
      return res.status(500).json({
        error: {
          code: 'COLLECTION_FAILED',
          message: result.errorMessage || 'Failed to collect jobs from Remotive',
        },
      });
    }

    const ingestionLog = await ingestionService.ingestJobs(result);

    res.json({
      data: {
        source: 'remotive',
        collected: result.totalCount,
        newJobs: ingestionLog.newJobs,
        duplicates: ingestionLog.duplicateJobs,
        failed: ingestionLog.failedJobs,
        ingestionId: ingestionLog.id,
      },
    });
  } catch (error: any) {
    console.error('Remotive collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /data-collection/collect/jobicy
 * Trigger Jobicy job collection (free public API)
 */
router.post('/collect/jobicy', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { industry, tag, count } = req.body;
    const collector = new JobicyCollector();
    const result = await collector.collect({ industry, tag, count });

    if (!result.success) {
      return res.status(500).json({
        error: {
          code: 'COLLECTION_FAILED',
          message: result.errorMessage || 'Failed to collect jobs from Jobicy',
        },
      });
    }

    const ingestionLog = await ingestionService.ingestJobs(result);

    res.json({
      data: {
        source: 'jobicy',
        collected: result.totalCount,
        newJobs: ingestionLog.newJobs,
        duplicates: ingestionLog.duplicateJobs,
        failed: ingestionLog.failedJobs,
        ingestionId: ingestionLog.id,
      },
    });
  } catch (error: any) {
    console.error('Jobicy collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /data-collection/collect/ats
 * Trigger direct ATS job collection from top tech companies (Cloudflare, Airbnb, Spotify, Notion, Razorpay, Figma, Stripe)
 */
router.post('/collect/ats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { boards, limitPerCompany } = req.body;
    const collector = new AtsCollector();
    const result = await collector.collect({ boards, limitPerCompany });

    if (!result.success) {
      return res.status(500).json({
        error: {
          code: 'COLLECTION_FAILED',
          message: result.errorMessage || 'Failed to collect jobs from ATS boards',
        },
      });
    }

    const ingestionLog = await ingestionService.ingestJobs(result);

    res.json({
      data: {
        source: 'ats_direct',
        collected: result.totalCount,
        newJobs: ingestionLog.newJobs,
        duplicates: ingestionLog.duplicateJobs,
        failed: ingestionLog.failedJobs,
        ingestionId: ingestionLog.id,
      },
    });
  } catch (error: any) {
    console.error('ATS collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /data-collection/collect/indeed
 * Trigger Indeed job collection
 */
router.post('/collect/indeed', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { query, location, limit } = req.body;

    const apiKey = process.env.INDEED_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: {
          code: 'API_KEY_MISSING',
          message: 'Indeed API key not configured',
        },
      });
    }

    const collector = new IndeedCollector({ apiKey });
    const result = await collector.collect({ query, location, limit });

    if (!result.success) {
      return res.status(500).json({
        error: {
          code: 'COLLECTION_FAILED',
          message: result.errorMessage || 'Failed to collect jobs from Indeed',
        },
      });
    }

    const ingestionLog = await ingestionService.ingestJobs(result);

    res.json({
      data: {
        source: 'indeed',
        collected: result.totalCount,
        newJobs: ingestionLog.newJobs,
        duplicates: ingestionLog.duplicateJobs,
        failed: ingestionLog.failedJobs,
        ingestionId: ingestionLog.id,
      },
    });
  } catch (error: any) {
    console.error('Indeed collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /data-collection/collect/remoteok
 * Trigger RemoteOK job collection (no API key needed)
 */
router.post('/collect/remoteok', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { limit } = req.body;

    const collector = new RemoteOKCollector();
    const result = await collector.collect({ limit });

    if (!result.success) {
      return res.status(500).json({
        error: {
          code: 'COLLECTION_FAILED',
          message: result.errorMessage || 'Failed to collect jobs from RemoteOK',
        },
      });
    }

    const ingestionLog = await ingestionService.ingestJobs(result);

    res.json({
      data: {
        source: 'remoteok',
        collected: result.totalCount,
        newJobs: ingestionLog.newJobs,
        duplicates: ingestionLog.duplicateJobs,
        failed: ingestionLog.failedJobs,
        ingestionId: ingestionLog.id,
      },
    });
  } catch (error: any) {
    console.error('RemoteOK collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /data-collection/collect/adzuna
 * Trigger Adzuna job collection (India-specific)
 */
router.post('/collect/adzuna', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { query, location, limit } = req.body;

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    
    if (!appId || !appKey) {
      return res.status(400).json({
        error: {
          code: 'API_KEY_MISSING',
          message: 'Adzuna API credentials not configured',
        },
      });
    }

    const collector = new AdzunaCollector({ apiKey: appId, apiSecret: appKey });
    const result = await collector.collect({ query, location, limit });

    if (!result.success) {
      return res.status(500).json({
        error: {
          code: 'COLLECTION_FAILED',
          message: result.errorMessage || 'Failed to collect jobs from Adzuna',
        },
      });
    }

    const ingestionLog = await ingestionService.ingestJobs(result);

    res.json({
      data: {
        source: 'adzuna',
        collected: result.totalCount,
        newJobs: ingestionLog.newJobs,
        duplicates: ingestionLog.duplicateJobs,
        failed: ingestionLog.failedJobs,
        ingestionId: ingestionLog.id,
      },
    });
  } catch (error: any) {
    console.error('Adzuna collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /data-collection/collect/jsearch
 * Trigger JSearch job collection (via RapidAPI)
 */
router.post('/collect/jsearch', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { query, location, remote, limit } = req.body;

    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: {
          code: 'API_KEY_MISSING',
          message: 'JSearch API key not configured',
        },
      });
    }

    const collector = new JSearchCollector({ apiKey });
    const result = await collector.collect({ query, location, remote, limit });

    if (!result.success) {
      return res.status(500).json({
        error: {
          code: 'COLLECTION_FAILED',
          message: result.errorMessage || 'Failed to collect jobs from JSearch',
        },
      });
    }

    const ingestionLog = await ingestionService.ingestJobs(result);

    res.json({
      data: {
        source: 'jsearch',
        collected: result.totalCount,
        newJobs: ingestionLog.newJobs,
        duplicates: ingestionLog.duplicateJobs,
        failed: ingestionLog.failedJobs,
        ingestionId: ingestionLog.id,
      },
    });
  } catch (error: any) {
    console.error('JSearch collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /data-collection/collect/all
 * Trigger collection from all available sources
 */
router.post('/collect/all', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const results: any[] = [];

    // 1. Remotive (Curated Developer Jobs - Free public API)
    try {
      const remotive = new RemotiveCollector();
      const remotiveResult = await remotive.collect({ category: 'software-dev', limit: 50 });
      if (remotiveResult.success && remotiveResult.jobs.length > 0) {
        const log = await ingestionService.ingestJobs(remotiveResult);
        results.push({ source: 'remotive', collected: remotiveResult.totalCount, newJobs: log.newJobs, duplicates: log.duplicateJobs });
      }
    } catch (error: any) {
      console.error('Remotive failed in bulk collection:', error.message);
    }

    // 2. Jobicy (Tech/Dev Jobs - Free public API)
    try {
      const jobicy = new JobicyCollector();
      const jobicyResult = await jobicy.collect({ industry: 'dev', count: 50 });
      if (jobicyResult.success && jobicyResult.jobs.length > 0) {
        const log = await ingestionService.ingestJobs(jobicyResult);
        results.push({ source: 'jobicy', collected: jobicyResult.totalCount, newJobs: log.newJobs, duplicates: log.duplicateJobs });
      }
    } catch (error: any) {
      console.error('Jobicy failed in bulk collection:', error.message);
    }

    // 3. ATS Direct Boards (Cloudflare, Airbnb, Spotify, Notion, Razorpay, Figma, Stripe)
    try {
      const ats = new AtsCollector();
      const atsResult = await ats.collect({ limitPerCompany: 10 });
      if (atsResult.success && atsResult.jobs.length > 0) {
        const log = await ingestionService.ingestJobs(atsResult);
        results.push({ source: 'ats_direct', collected: atsResult.totalCount, newJobs: log.newJobs, duplicates: log.duplicateJobs });
      }
    } catch (error: any) {
      console.error('ATS collection failed in bulk collection:', error.message);
    }

    // 4. RemoteOK (Remote Developer Roles - Free public API)
    try {
      const remoteOK = new RemoteOKCollector();
      const remoteResult = await remoteOK.collect({ limit: 50 });
      if (remoteResult.success && remoteResult.jobs.length > 0) {
        const log = await ingestionService.ingestJobs(remoteResult);
        results.push({ source: 'remoteok', collected: remoteResult.totalCount, newJobs: log.newJobs, duplicates: log.duplicateJobs });
      }
    } catch (error: any) {
      console.error('RemoteOK failed:', error.message);
    }

    // 5. Adzuna (Massive India Tech & Domestic Coverage)
    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaAppKey = process.env.ADZUNA_APP_KEY;
    if (adzunaAppId && adzunaAppKey) {
      try {
        const adzuna = new AdzunaCollector({ apiKey: adzunaAppId, apiSecret: adzunaAppKey });
        const adzunaResult = await adzuna.collect({ query: 'software developer', limit: 50 });
        if (adzunaResult.success && adzunaResult.jobs.length > 0) {
          const log = await ingestionService.ingestJobs(adzunaResult);
          results.push({ source: 'adzuna', collected: adzunaResult.totalCount, newJobs: log.newJobs, duplicates: log.duplicateJobs });
        }
      } catch (error: any) {
        console.error('Adzuna failed:', error.message);
      }
    }

    // 6. JSearch (RapidAPI Multi-Source Search)
    const jsearchKey = process.env.JSEARCH_API_KEY;
    if (jsearchKey) {
      try {
        const jsearch = new JSearchCollector({ apiKey: jsearchKey });
        const jsearchResult = await jsearch.collect({ query: 'software developer jobs in India', country: 'in', limit: 30 });
        if (jsearchResult.success && jsearchResult.jobs.length > 0) {
          const log = await ingestionService.ingestJobs(jsearchResult);
          results.push({ source: 'jsearch', collected: jsearchResult.totalCount, newJobs: log.newJobs, duplicates: log.duplicateJobs });
        }
      } catch (error: any) {
        console.error('JSearch failed:', error.message);
      }
    }

    // 7. Indeed (if configured)
    const indeedKey = process.env.INDEED_API_KEY;
    if (indeedKey) {
      try {
        const indeed = new IndeedCollector({ apiKey: indeedKey });
        const indeedResult = await indeed.collect({ query: 'software developer', location: 'India', limit: 50 });
        if (indeedResult.success && indeedResult.jobs.length > 0) {
          const log = await ingestionService.ingestJobs(indeedResult);
          results.push({ source: 'indeed', collected: indeedResult.totalCount, newJobs: log.newJobs, duplicates: log.duplicateJobs });
        }
      } catch (error: any) {
        console.error('Indeed failed:', error.message);
      }
    }

    const totalNew = results.reduce((sum, r) => sum + r.newJobs, 0);
    const totalDuplicates = results.reduce((sum, r) => sum + r.duplicates, 0);

    res.json({
      data: {
        sources: results,
        totalNewJobs: totalNew,
        totalDuplicates,
      },
    });
  } catch (error: any) {
    console.error('Bulk collection error:', error);
    res.status(500).json({
      error: {
        code: 'COLLECTION_ERROR',
        message: error.message,
      },
    });
  }
});

// ============================================================================
// MARKET INTELLIGENCE & ANALYTICS
// ============================================================================

/**
 * POST /data-collection/aggregate/skills
 * Compute skill demand trends and market intelligence
 */
router.post('/aggregate/skills', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { daysBack = 30 } = req.body;
    const result = await skillDemandAggregator.calculateSkillDemand(daysBack);

    res.json({
      data: {
        topSkills: result.slice(0, 50), // Top 50 in-demand skills
        totalSkillsTracked: result.length,
        analysisWindow: `${daysBack} days`,
      },
    });
  } catch (error: any) {
    console.error('Skill aggregation error:', error);
    res.status(500).json({
      error: {
        code: 'AGGREGATION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * GET /data-collection/stats
 * Get collection statistics
 */
router.get('/stats', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const db = getDb();

    // Total jobs
    const totalJobs = await db.prepare('SELECT COUNT(*) as count FROM job_postings').get() as { count: number };

    // By source
    const bySource = await db.prepare(`
      SELECT source, COUNT(*) as count
      FROM job_postings
      GROUP BY source
    `).all() as Array<{ source: string; count: number }>;

    // Recent ingestions
    const recentIngestions = await db.prepare(`
      SELECT id, source, new_jobs, duplicate_jobs, failed_jobs, created_at
      FROM ingestion_logs
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    res.json({
      data: {
        totalJobs: Number(totalJobs?.count || 0),
        bySource: bySource || [],
        recentIngestions: recentIngestions || [],
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: {
        code: 'STATS_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * GET /data-collection/jobs
 * Get collected jobs with filters
 */
router.get('/jobs', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { source, limit = 50, offset = 0 } = req.query;
    const db = getDb();

    let query = 'SELECT * FROM job_postings';
    const params: any[] = [];

    if (source) {
      query += ' WHERE source = ?';
      params.push(source);
    }

    query += ' ORDER BY collected_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const jobs = await db.prepare(query).all(...params);

    res.json({
      data: {
        jobs: jobs || [],
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error: any) {
    console.error('Jobs query error:', error);
    res.status(500).json({
      error: {
        code: 'QUERY_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * GET /data-collection/logs
 * Get ingestion logs
 */
router.get('/logs', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const db = getDb();

    const logs = await db.prepare(`
      SELECT * FROM ingestion_logs
      ORDER BY created_at DESC
      LIMIT ?
    `).all(Number(limit));

    res.json({
      data: { logs: logs || [] },
    });
  } catch (error: any) {
    console.error('Logs query error:', error);
    res.status(500).json({
      error: {
        code: 'QUERY_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
