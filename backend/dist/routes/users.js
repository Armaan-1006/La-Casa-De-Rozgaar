import { Router } from 'express';
import { getDb } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
// ---- LIST USERS (ADMIN) ----
router.get('/', authorize('ADMIN'), (req, res) => {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 25;
    const offset = (page - 1) * pageSize;
    const role = req.query.role;
    let query = 'SELECT id, email, name, role, is_active, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    if (role) {
        query += ' AND role = ?';
        params.push(role);
    }
    const totalQuery = query.replace('SELECT id, email, name, role, is_active, created_at, updated_at', 'SELECT COUNT(*) as count');
    const total = db.prepare(totalQuery).get(...params).count;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);
    const users = db.prepare(query).all(...params);
    return res.json({ data: users, meta: { requestId: req.requestId, page, pageSize, total } });
});
// ---- GET USER ----
router.get('/:id', authorize('ADMIN'), (req, res) => {
    const db = getDb();
    const user = db.prepare('SELECT id, email, name, role, is_active, created_at, updated_at FROM users WHERE id = ?').get(req.params.id);
    if (!user)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', requestId: req.requestId } });
    return res.json({ data: user, meta: { requestId: req.requestId } });
});
// ---- UPDATE USER (ADMIN) ----
router.put('/:id', authorize('ADMIN'), (req, res) => {
    const db = getDb();
    const { name, role, isActive } = req.body;
    const updates = [];
    const params = [];
    if (name) {
        updates.push('name = ?');
        params.push(name);
    }
    if (role) {
        updates.push('role = ?');
        params.push(role);
    }
    if (isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(isActive ? 1 : 0);
    }
    if (updates.length) {
        updates.push(`updated_at = datetime('now')`);
        params.push(req.params.id);
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }
    return res.json({ data: { message: 'User updated' }, meta: { requestId: req.requestId } });
});
// ---- DEACTIVATE USER (ADMIN) ----
router.delete('/:id', authorize('ADMIN'), (req, res) => {
    const db = getDb();
    db.prepare(`UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).run(req.params.id);
    return res.json({ data: { message: 'User deactivated' }, meta: { requestId: req.requestId } });
});
// ---- AUDIT LOG (ADMIN) ----
router.get('/:id/audit-log', authorize('ADMIN'), (req, res) => {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    const total = db.prepare('SELECT COUNT(*) as count FROM audit_log WHERE user_id = ?').get(req.params.id).count;
    const logs = db.prepare('SELECT * FROM audit_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(req.params.id, pageSize, offset);
    logs.forEach(l => { l.metadata = JSON.parse(l.metadata || '{}'); });
    return res.json({ data: logs, meta: { requestId: req.requestId, page, pageSize, total } });
});
export default router;
//# sourceMappingURL=users.js.map