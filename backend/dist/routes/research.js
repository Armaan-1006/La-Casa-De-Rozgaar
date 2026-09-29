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
        const type = req.query.type;
        const topic = req.query.topic;
        const industry = req.query.industry;
        let query = 'SELECT * FROM research_items WHERE 1=1';
        const params = [];
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        if (topic) {
            query += ' AND topic LIKE ?';
            params.push(`%${topic}%`);
        }
        if (industry) {
            query += ' AND industry = ?';
            params.push(industry);
        }
        const totalQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
        const countRes = await db.prepare(totalQuery).get(...params);
        const total = Number(countRes?.count || 0);
        query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
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