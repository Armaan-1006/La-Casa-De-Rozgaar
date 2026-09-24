import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getIntelligenceProvider } from '../intelligence/index.js';

const router = Router();
router.use(authenticate);

// ---- GET COMPENSATION DATA ----
router.get('/', async (req: Request, res: Response) => {
  try {
    const intel = getIntelligenceProvider();
    const roleId = req.query.roleId as string;
    const location = req.query.location as string;
    const experienceYears = req.query.experienceYears ? parseFloat(req.query.experienceYears as string) : undefined;

    if (!roleId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'roleId is required', requestId: req.requestId } });
    }

    const data = await intel.getCompensation({ roleId, location, experienceYears });

    return res.json({ data, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'COMPENSATION_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- GET FORECAST ----
router.get('/forecast', async (req: Request, res: Response) => {
  try {
    const intel = getIntelligenceProvider();
    const roleId = req.query.roleId as string;
    const skillId = req.query.skillId as string;
    const horizon = (req.query.horizon as '3m' | '6m' | '12m' | '24m') || '12m';

    if (!roleId && !skillId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'roleId or skillId is required', requestId: req.requestId } });
    }

    const data = await intel.getForecast({ roleIds: roleId ? [roleId] : undefined, skillIds: skillId ? [skillId] : undefined, horizon });

    return res.json({ data, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'FORECAST_ERROR', message: err.message, requestId: req.requestId } });
  }
});

export default router;
