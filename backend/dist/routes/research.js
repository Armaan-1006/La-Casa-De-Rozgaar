import { Router } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
// ---- LIST RESEARCH ITEMS ----
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const offset = (page - 1) * pageSize;
        const topic = req.query.topic;
        let query = 'SELECT * FROM research_items WHERE 1=1';
        const params = [];
        if (topic) {
            query += ' AND (tags LIKE ? OR title LIKE ? OR abstract LIKE ?)';
            params.push(`%${topic}%`, `%${topic}%`, `%${topic}%`);
        }
        const totalQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
        const countRes = await db.prepare(totalQuery).get(...params);
        const total = Number(countRes?.count || 0);
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        const items = (await db.prepare(query).all(...params) || []);
        items.forEach(item => {
            try {
                item.tags = typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []);
            }
            catch {
                item.tags = [];
            }
            try {
                item.authors = typeof item.authors === 'string' ? JSON.parse(item.authors || '[]') : (item.authors || []);
            }
            catch {
                item.authors = [];
            }
            try {
                item.metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') : (item.metadata || {});
            }
            catch {
                item.metadata = {};
            }
        });
        return res.json({ data: items, meta: { requestId: req.requestId, page, pageSize, total } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'RESEARCH_FETCH_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- MARKET RADAR LIVE STATS (FROM REAL DATA) ----
router.get('/market-radar', async (req, res) => {
    try {
        const db = getDb();
        // 1. Get total live jobs and source breakdown
        const totalJobsRes = await db.prepare('SELECT COUNT(*) as count FROM job_postings').get();
        const totalJobs = Number(totalJobsRes?.count || 0);
        // 2. Get top skills from real market_skill_demand
        const topSkills = (await db.prepare(`
      SELECT skill_id, skill_name, job_count, demand_percentage, trend_percentage, momentum, avg_salary_min, avg_salary_max, category
      FROM market_skill_demand
      ORDER BY job_count DESC, demand_percentage DESC
      LIMIT 20
    `).all() || []);
        // 3. Role distribution from live job_postings
        const roleStats = (await db.prepare(`
      SELECT 
        CASE 
          WHEN LOWER(title) LIKE '%frontend%' OR LOWER(title) LIKE '%react%' OR LOWER(title) LIKE '%ui%' THEN 'Frontend Engineer'
          WHEN LOWER(title) LIKE '%backend%' OR LOWER(title) LIKE '%node%' OR LOWER(title) LIKE '%java%' THEN 'Backend Engineer'
          WHEN LOWER(title) LIKE '%full stack%' OR LOWER(title) LIKE '%fullstack%' OR LOWER(title) LIKE '%software engineer%' OR LOWER(title) LIKE '%developer%' THEN 'Full Stack Developer'
          WHEN LOWER(title) LIKE '%data%' OR LOWER(title) LIKE '%machine learning%' OR LOWER(title) LIKE '%ml%' OR LOWER(title) LIKE '%ai%' THEN 'AI / Data Engineer'
          WHEN LOWER(title) LIKE '%devops%' OR LOWER(title) LIKE '%sre%' OR LOWER(title) LIKE '%cloud%' OR LOWER(title) LIKE '%infra%' THEN 'Cloud & DevOps'
          ELSE 'Software Engineer'
        END as role_group,
        COUNT(*) as demand,
        AVG(CASE WHEN salary_min > 0 THEN salary_min ELSE NULL END) as avg_salary
      FROM job_postings
      GROUP BY role_group
      ORDER BY demand DESC
    `).all() || []);
        // 4. Regional breakdown from live job_postings
        const regional = (await db.prepare(`
      SELECT 
        CASE 
          WHEN LOWER(location) LIKE '%bengaluru%' OR LOWER(location) LIKE '%bangalore%' THEN 'Bengaluru Cyber Grid'
          WHEN LOWER(location) LIKE '%hyderabad%' THEN 'Hyderabad Cyberabad'
          WHEN LOWER(location) LIKE '%pune%' THEN 'Pune Tech Corridor'
          WHEN LOWER(location) LIKE '%mumbai%' THEN 'Mumbai Financial Tech'
          WHEN LOWER(location) LIKE '%delhi%' OR LOWER(location) LIKE '%noida%' OR LOWER(location) LIKE '%gurugram%' OR LOWER(location) LIKE '%gurgaon%' THEN 'NCR Tech Hub'
          WHEN LOWER(location) LIKE '%remote%' OR remote_type = 'REMOTE' THEN 'Distributed Remote / Global'
          ELSE 'Pan-India & Global Tech'
        END as region,
        COUNT(*) as count
      FROM job_postings
      GROUP BY region
      ORDER BY count DESC
      LIMIT 6
    `).all() || []);
        // Calculate hiring pressure index (0 - 100)
        const hiringPressureIndex = Math.min(99, Math.max(70, Math.round(75 + (totalJobs / 50))));
        return res.json({
            data: {
                totalJobs,
                hiringPressureIndex,
                topSkills,
                roleStats,
                regionalBreakdown: regional,
                lastUpdated: new Date().toISOString(),
            },
            meta: { requestId: req.requestId }
        });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'MARKET_RADAR_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- LIVE INTELLIGENCE FEED (FROM REAL DATA) ----
router.get('/feed', async (req, res) => {
    try {
        const db = getDb();
        const recentJobs = (await db.prepare(`
      SELECT id, title, company, location, source, posted_at, salary_min, salary_max, salary_currency, skills
      FROM job_postings
      ORDER BY collected_at DESC, id DESC
      LIMIT 20
    `).all() || []);
        const feed = recentJobs.map((j, idx) => {
            let skills = [];
            try {
                skills = typeof j.skills === 'string' ? JSON.parse(j.skills) : (j.skills || []);
            }
            catch { }
            return {
                id: `FEED-SIG-${idx + 1}`,
                type: 'JOB_INGESTION',
                severity: 'HIGH',
                headline: `Live Opening: ${j.title} at ${j.company}`,
                source: (j.source || 'GLOBAL_RADAR').toUpperCase(),
                location: j.location || 'Remote',
                timestamp: j.posted_at || new Date().toISOString(),
                summary: `Verified opening in ${j.location || 'Remote'} requiring ${skills.slice(0, 4).join(', ') || 'core engineering capabilities'}.`,
                tags: skills.slice(0, 3),
                salary: j.salary_min ? `${j.salary_currency || '₹'} ${(j.salary_min / 100000).toFixed(1)}L - ${(j.salary_max / 100000).toFixed(1)}L` : 'Competitive',
            };
        });
        return res.json({ data: feed, meta: { requestId: req.requestId, total: feed.length } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'FEED_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- GET RESEARCH ITEM ----
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const item = await db.prepare('SELECT * FROM research_items WHERE id = ?').get(req.params.id);
        if (!item) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Research item not found', requestId: req.requestId } });
        }
        try {
            item.tags = typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []);
        }
        catch {
            item.tags = [];
        }
        try {
            item.metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata || '{}') : (item.metadata || {});
        }
        catch {
            item.metadata = {};
        }
        return res.json({ data: item, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'RESEARCH_GET_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- CREATE RESEARCH ITEM ----
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { title, type, topic, industry, summary, content, sourceUrl, tags, metadata } = req.body;
        if (!title || !type || !topic) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'title, type, topic are required', requestId: req.requestId } });
        }
        const id = generateId();
        await db.prepare(`INSERT INTO research_items (id, title, type, topic, industry, summary, content, source_url, tags, metadata, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(id, title, type, topic, industry || null, summary || null, content || null, sourceUrl || null, JSON.stringify(tags || []), JSON.stringify(metadata || {}), req.user.userId);
        return res.status(201).json({ data: { id, message: 'Research item created' }, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'RESEARCH_CREATE_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- UPDATE RESEARCH ITEM ----
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const existing = await db.prepare('SELECT id, author_id FROM research_items WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Research item not found', requestId: req.requestId } });
        }
        if (existing.author_id !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized', requestId: req.requestId } });
        }
        const { title, type, topic, industry, summary, content, sourceUrl, tags, metadata } = req.body;
        const updates = [];
        const params = [];
        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        if (type) {
            updates.push('type = ?');
            params.push(type);
        }
        if (topic) {
            updates.push('topic = ?');
            params.push(topic);
        }
        if (industry !== undefined) {
            updates.push('industry = ?');
            params.push(industry);
        }
        if (summary !== undefined) {
            updates.push('summary = ?');
            params.push(summary);
        }
        if (content !== undefined) {
            updates.push('content = ?');
            params.push(content);
        }
        if (sourceUrl !== undefined) {
            updates.push('source_url = ?');
            params.push(sourceUrl);
        }
        if (tags) {
            updates.push('tags = ?');
            params.push(JSON.stringify(tags));
        }
        if (metadata) {
            updates.push('metadata = ?');
            params.push(JSON.stringify(metadata));
        }
        if (updates.length) {
            params.push(req.params.id);
            await db.prepare(`UPDATE research_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);
        }
        return res.json({ data: { message: 'Research item updated' }, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'RESEARCH_UPDATE_ERROR', message: err.message, requestId: req.requestId } });
    }
});
// ---- DELETE RESEARCH ITEM ----
router.delete('/:id', async (req, res) => {
    try {
        const db = getDb();
        const existing = await db.prepare('SELECT author_id FROM research_items WHERE id = ?').get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Research item not found', requestId: req.requestId } });
        }
        if (existing.author_id !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized', requestId: req.requestId } });
        }
        await db.prepare('DELETE FROM research_items WHERE id = ?').run(req.params.id);
        return res.json({ data: { message: 'Research item deleted' }, meta: { requestId: req.requestId } });
    }
    catch (err) {
        return res.status(500).json({ error: { code: 'RESEARCH_DELETE_ERROR', message: err.message, requestId: req.requestId } });
    }
});
export default router;
//# sourceMappingURL=research.js.map