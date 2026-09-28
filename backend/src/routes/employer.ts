import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate, authorize, requireOrganization } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// ---- CREATE ORGANIZATION ----
router.post('/', authorize('EMPLOYER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, industry, size, location, website, description, logoUrl } = req.body;
    if (!name) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name is required', requestId: req.requestId } });

    const id = generateId();
    await db.prepare(`INSERT INTO organizations (id, name, industry, size, location, website, description, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, name, industry || null, size || null, location || null, website || null, description || null, logoUrl || null);

    // Add creator as org_admin
    await db.prepare('INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)')
      .run(generateId(), id, req.user!.userId, 'org_admin');

    return res.status(201).json({ data: { id, message: 'Organization created' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ORG_CREATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- GET MY ORGANIZATIONS ----
router.get('/my', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const orgs = (await db.prepare(`
      SELECT o.*, ou.role as my_role
      FROM organizations o
      JOIN organization_users ou ON o.id = ou.organization_id
      WHERE ou.user_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user!.userId) || []) as any[];
    return res.json({ data: orgs, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ORG_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- EMPLOYER OVERVIEW (DASHBOARD METRICS) ----
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    let org = await db.prepare('SELECT o.* FROM organizations o JOIN organization_users ou ON o.id = ou.organization_id WHERE ou.user_id = ? LIMIT 1').get(req.user!.userId) as any;
    if (!org) {
      org = await db.prepare('SELECT * FROM organizations LIMIT 1').get() as any;
    }
    if (!org) {
      const orgId = generateId();
      await db.prepare('INSERT INTO organizations (id, name, industry, size, location) VALUES (?, ?, ?, ?, ?)')
        .run(orgId, 'TechCorp India', 'Enterprise Software', '850+', 'Bangalore, India');
      org = await db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId) as any;
    }

    const rolesCount = await db.prepare('SELECT COUNT(*) as count FROM organization_roles WHERE organization_id = ?').get(org.id) as { count: number | string };
    const activeCandidates = await db.prepare('SELECT COUNT(*) as count FROM candidate_profiles').get() as { count: number | string };

    return res.json({
      data: {
        organization: org,
        activeRoles: Number(rolesCount?.count || 0),
        activeCandidates: Number(activeCandidates?.count || 0),
        activeWorkforce: 850,
        openRequisitions: 45,
        hiringDifficulty: 'HIGH // CLOUD & AI SPECIALISTS',
        avgTimeToHire: '38 Days'
      },
      meta: { requestId: req.requestId }
    });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'OVERVIEW_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- GET ORGANIZATION ----
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const org = await db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id) as any;
    if (!org) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Organization not found', requestId: req.requestId } });

    // Check if user is a member
    const membership = await db.prepare('SELECT role FROM organization_users WHERE organization_id = ? AND user_id = ?').get(req.params.id, req.user!.userId) as any;
    if (membership) org.myRole = membership.role;

    return res.json({ data: org, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ORG_GET_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- UPDATE ORGANIZATION ----
router.put('/:id', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, industry, size, location, website, description, logoUrl } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (industry !== undefined) { updates.push('industry = ?'); params.push(industry); }
    if (size !== undefined) { updates.push('size = ?'); params.push(size); }
    if (location !== undefined) { updates.push('location = ?'); params.push(location); }
    if (website !== undefined) { updates.push('website = ?'); params.push(website); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (logoUrl !== undefined) { updates.push('logo_url = ?'); params.push(logoUrl); }

    if (updates.length) {
      updates.push(`updated_at = NOW()`);
      params.push(req.params.id);
      await db.prepare(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    return res.json({ data: { message: 'Organization updated' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ORG_UPDATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- MANAGE MEMBERS ----
router.get('/:id/members', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const members = (await db.prepare(`
      SELECT ou.*, u.email, u.name as user_name
      FROM organization_users ou
      JOIN users u ON ou.user_id = u.id
      WHERE ou.organization_id = ?
    `).all(req.params.id) || []) as any[];
    return res.json({ data: members, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'MEMBERS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/:id/members', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { userId, role } = req.body;
    if (!userId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'userId is required', requestId: req.requestId } });

    // Check user exists
    const user = await db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId } });

    try {
      await db.prepare('INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)')
        .run(generateId(), req.params.id, userId, role || 'member');
    } catch {
      return res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'User is already a member', requestId: req.requestId } });
    }

    return res.status(201).json({ data: { message: 'Member added' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'MEMBER_ADD_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.put('/:id/members/:userId', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'role is required', requestId: req.requestId } });

    await db.prepare('UPDATE organization_users SET role = ? WHERE organization_id = ? AND user_id = ?')
      .run(role, req.params.id, req.params.userId);

    return res.json({ data: { message: 'Member role updated' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'MEMBER_UPDATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.delete('/:id/members/:userId', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    await db.prepare('DELETE FROM organization_users WHERE organization_id = ? AND user_id = ?')
      .run(req.params.id, req.params.userId);
    return res.json({ data: { message: 'Member removed' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'MEMBER_DELETE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- ORGANIZATION ROLES (JOB LISTINGS) ----
router.get('/:id/roles', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const offset = (page - 1) * pageSize;
    const status = req.query.status as string;

    let query = 'SELECT * FROM organization_roles WHERE organization_id = ?';
    const params: any[] = [req.params.id];

    if (status) { query += ' AND status = ?'; params.push(status); }

    const countRes = await db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params) as { count: number | string };
    const total = Number(countRes?.count || 0);
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const roles = (await db.prepare(query).all(...params) || []) as any[];
    roles.forEach(r => {
      try { r.required_skills = typeof r.required_skills === 'string' ? JSON.parse(r.required_skills || '[]') : (r.required_skills || []); } catch { r.required_skills = []; }
      try { r.preferred_skills = typeof r.preferred_skills === 'string' ? JSON.parse(r.preferred_skills || '[]') : (r.preferred_skills || []); } catch { r.preferred_skills = []; }
    });

    return res.json({ data: roles, meta: { requestId: req.requestId, page, pageSize, total } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ROLES_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.post('/:id/roles', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { title, department, location, employmentType, experienceMin, experienceMax, salaryMin, salaryMax, currency, description, requiredSkills, preferredSkills } = req.body;
    if (!title) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'title is required', requestId: req.requestId } });

    const id = generateId();
    await db.prepare(`INSERT INTO organization_roles (id, organization_id, title, department, location, employment_type, experience_min, experience_max, salary_min, salary_max, currency, description, required_skills, preferred_skills, posted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, req.params.id, title, department || null, location || null, employmentType || 'FULL_TIME',
        experienceMin || null, experienceMax || null, salaryMin || null, salaryMax || null, currency || 'INR',
        description || null, JSON.stringify(requiredSkills || []), JSON.stringify(preferredSkills || []), req.user!.userId);

    return res.status(201).json({ data: { id, message: 'Role created' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ROLE_CREATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

router.put('/:id/roles/:roleId', requireOrganization, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { title, department, location, employmentType, status, experienceMin, experienceMax, salaryMin, salaryMax, description, requiredSkills, preferredSkills } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (title) { updates.push('title = ?'); params.push(title); }
    if (department !== undefined) { updates.push('department = ?'); params.push(department); }
    if (location !== undefined) { updates.push('location = ?'); params.push(location); }
    if (employmentType) { updates.push('employment_type = ?'); params.push(employmentType); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (experienceMin !== undefined) { updates.push('experience_min = ?'); params.push(experienceMin); }
    if (experienceMax !== undefined) { updates.push('experience_max = ?'); params.push(experienceMax); }
    if (salaryMin !== undefined) { updates.push('salary_min = ?'); params.push(salaryMin); }
    if (salaryMax !== undefined) { updates.push('salary_max = ?'); params.push(salaryMax); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (requiredSkills) { updates.push('required_skills = ?'); params.push(JSON.stringify(requiredSkills)); }
    if (preferredSkills) { updates.push('preferred_skills = ?'); params.push(JSON.stringify(preferredSkills)); }

    if (updates.length) {
      updates.push(`updated_at = NOW()`);
      params.push(req.params.roleId, req.params.id);
      await db.prepare(`UPDATE organization_roles SET ${updates.join(', ')} WHERE id = ? AND organization_id = ?`).run(...params);
    }

    return res.json({ data: { message: 'Role updated' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'ROLE_UPDATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

export default router;
