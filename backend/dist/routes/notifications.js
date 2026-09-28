import { Router } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
// ---- LIST NOTIFICATIONS ----
router.get('/', (req, res) => {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 25;
    const offset = (page - 1) * pageSize;
    const unreadOnly = req.query.unread === 'true';
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [req.user.userId];
    if (unreadOnly) {
        query += ' AND read_at IS NULL';
    }
    const totalQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const total = db.prepare(totalQuery).get(...params).count;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);
    const notifications = db.prepare(query).all(...params);
    notifications.forEach(n => { n.metadata = JSON.parse(n.metadata || '{}'); });
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL').get(req.user.userId).count;
    return res.json({ data: notifications, meta: { requestId: req.requestId, page, pageSize, total, unreadCount } });
});
// ---- MARK AS READ ----
router.put('/:id/read', (req, res) => {
    const db = getDb();
    db.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.userId);
    return res.json({ data: { message: 'Notification marked as read' }, meta: { requestId: req.requestId } });
});
// ---- MARK ALL AS READ ----
router.put('/read-all', (req, res) => {
    const db = getDb();
    db.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL`).run(req.user.userId);
    return res.json({ data: { message: 'All notifications marked as read' }, meta: { requestId: req.requestId } });
});
// ---- DELETE NOTIFICATION ----
router.delete('/:id', (req, res) => {
    const db = getDb();
    db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
    return res.json({ data: { message: 'Notification deleted' }, meta: { requestId: req.requestId } });
});
// ---- CREATE NOTIFICATION (INTERNAL HELPER — also used by other routes) ----
export function createNotification(userId, type, title, message, metadata = {}) {
    const db = getDb();
    db.prepare('INSERT INTO notifications (id, user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?, ?)')
        .run(generateId(), userId, type, title, message, JSON.stringify(metadata));
}
export default router;
//# sourceMappingURL=notifications.js.map