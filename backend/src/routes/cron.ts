// ============================================================================
// CRON TRIGGER ROUTES
// Secure endpoints for Vercel Cron or external schedulers
// ============================================================================

import { Router, Request, Response } from 'express';
import { SchedulerService } from '../services/data-collection/scheduler-service.js';

const router = Router();
const scheduler = SchedulerService.getInstance();

/**
 * GET /api/v1/cron/collect-jobs
 * Triggered automatically by Vercel Cron or uptime monitor
 */
router.get('/collect-jobs', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // Verify secret if configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development or if no auth provided, check query param
      if (req.query.key !== cronSecret) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid CRON secret authorization',
          },
        });
      }
    }

    const result = await scheduler.runFullSync('VERCEL_CRON');

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error('Cron collection error:', error);
    res.status(500).json({
      error: {
        code: 'CRON_EXECUTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * POST /api/v1/cron/collect-jobs
 * Alternative POST trigger
 */
router.post('/collect-jobs', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (req.query.key !== cronSecret) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid CRON secret authorization',
          },
        });
      }
    }

    const result = await scheduler.runFullSync('POST_CRON');

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error('Cron collection error:', error);
    res.status(500).json({
      error: {
        code: 'CRON_EXECUTION_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
