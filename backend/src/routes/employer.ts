import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate, authorize, requireOrganization } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// ---- CREATE ORGANIZATION ----
router.post('/', authorize('EMPLOYER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { name, industry, size, location, website, description, logoUrl } = req.body;
  if (!name) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name is required', requestId: req.requestId } });

  const id = generateId();
  db.prepare(`INSERT INTO organizations (id, name, industry, size, location, website, description, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, industry || null, size || null, location || null, website || null, description || null, logoUrl || null);

  // Add creator as org_admin
  db.prepare('INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)')
    .run(generateId(), id, req.user!.userId, 'org_admin');

  return res.status(201).json({ data: { id, message: 'Organization created' }, meta: { requestId: req.requestId } });
});

// ---- GET MY ORGANIZATIONS ----
router.get('/my', (req: Request, res: Response) => {
  const db = getDb();
  const orgs = db.prepare(`
    SELECT o.*, ou.role as my_role
    FROM organizations o
    JOIN organization_users ou ON o.id = ou.organization_id
    WHERE ou.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user!.userId);
  return res.json({ data: orgs, meta: { requestId: req.requestId } });
});

// ---- GET ORGANIZATION ----
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id) as any;
  if (!org) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Organization not found', requestId: req.requestId } });

  // Check if user is a member
  const membership = db.prepare('SELECT role FROM organization_users WHERE organization_id = ? AND user_id = ?').get(req.params.id, req.user!.userId) as any;
  if (membership) org.myRole = membership.role;

  return res.json({ data: org, meta: { requestId: req.requestId } });
});

// ---- UPDATE ORGANIZATION ----
router.put('/:id', requireOrganization, (req: Request, res: Response) => {
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
    updates.push(`updated_at = datetime('now')`);
    params.push(req.params.id);
    db.prepare(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  return res.json({ data: { message: 'Organization updated' }, meta: { requestId: req.requestId } });
});

// ---- MANAGE MEMBERS ----
router.get('/:id/members', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const members = db.prepare(`
    SELECT ou.*, u.email, u.name as user_name
    FROM organization_users ou
    JOIN users u ON ou.user_id = u.id
    WHERE ou.organization_id = ?
  `).all(req.params.id);
  return res.json({ data: members, meta: { requestId: req.requestId } });
});

router.post('/:id/members', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { userId, role } = req.body;
  if (!userId) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'userId is required', requestId: req.requestId } });

  // Check user exists
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId } });

  try {
    db.prepare('INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)')
      .run(generateId(), req.params.id, userId, role || 'member');
  } catch {
    return res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'User is already a member', requestId: req.requestId } });
  }

  return res.status(201).json({ data: { message: 'Member added' }, meta: { requestId: req.requestId } });
});

router.put('/:id/members/:userId', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'role is required', requestId: req.requestId } });

  db.prepare('UPDATE organization_users SET role = ? WHERE organization_id = ? AND user_id = ?')
    .run(role, req.params.id, req.params.userId);

  return res.json({ data: { message: 'Member role updated' }, meta: { requestId: req.requestId } });
});

router.delete('/:id/members/:userId', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM organization_users WHERE organization_id = ? AND user_id = ?')
    .run(req.params.id, req.params.userId);
  return res.json({ data: { message: 'Member removed' }, meta: { requestId: req.requestId } });
});

// ---- ORGANIZATION ROLES (JOB LISTINGS) ----
router.get('/:id/roles', (req: Request, res: Response) => {
  const db = getDb();
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 25;
  const offset = (page - 1) * pageSize;
  const status = req.query.status as string;

  let query = 'SELECT * FROM organization_roles WHERE organization_id = ?';
  const params: any[] = [req.params.id];

  if (status) { query += ' AND status = ?'; params.push(status); }

  const total = (db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params) as { count: number }).count;
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, offset);

  const roles = db.prepare(query).all(...params) as any[];
  roles.forEach(r => {
    r.required_skills = JSON.parse(r.required_skills || '[]');
    r.preferred_skills = JSON.parse(r.preferred_skills || '[]');
  });

  return res.json({ data: roles, meta: { requestId: req.requestId, page, pageSize, total } });
});

router.post('/:id/roles', requireOrganization, (req: Request, res: Response) => {
  const db = getDb();
  const { title, department, location, employmentType, experienceMin, experienceMax, salaryMin, salaryMax, currency, description, requiredSkills, preferredSkills } = req.body;
  if (!title) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'title is required', requestId: req.requestId } });

  const id = generateId();
  db.prepare(`INSERT INTO organization_roles (id, organization_id, title, department, location, employment_type, experience_min, experience_max, salary_min, salary_max, currency, description, required_skills, preferred_skills, posted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.params.id, title, department || null, location || null, employmentType || 'FULL_TIME',
      experienceMin || null, experienceMax || null, salaryMin || null, salaryMax || null, currency || 'INR',
      description || null, JSON.stringify(requiredSkills || []), JSON.stringify(preferredSkills || []), req.user!.userId);

  return res.status(201).json({ data: { id, message: 'Role created' }, meta: { requestId: req.requestId } });
});

router.put('/:id/roles/:roleId', requireOrganization, (req: Request, res: Response) => {
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
    updates.push(`updated_at = datetime('now')`);
    params.push(req.params.roleId, req.params.id);
    db.prepare(`UPDATE organization_roles SET ${updates.join(', ')} WHERE id = ? AND organization_id = ?`).run(...params);
  }

  return res.json({ data: { message: 'Role updated' }, meta: { requestId: req.requestId } });
});

export default router;
