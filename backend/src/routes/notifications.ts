import { Router, Request, Response } from 'express';
import { getDb, generateId } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// ---- LIST NOTIFICATIONS ----
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    const offset = (page - 1) * pageSize;
    const unreadOnly = req.query.unread === 'true';

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: any[] = [req.user!.userId];

    if (unreadOnly) { query += ' AND read = 0'; }

    const totalQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countRes = await db.prepare(totalQuery).get(...params) as { count: number | string };
    const total = Number(countRes?.count || 0);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const notifications = (await db.prepare(query).all(...params) || []) as any[];
    notifications.forEach(n => {
      try { n.metadata = typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : (n.metadata || {}); } catch { n.metadata = {}; }
      n.isRead = Boolean(n.read);
    });

    const unreadRes = await db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(req.user!.userId) as { count: number | string };
    const unreadCount = Number(unreadRes?.count || 0);

    return res.json({ data: notifications, meta: { requestId: req.requestId, page, pageSize, total, unreadCount } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'NOTIFICATIONS_FETCH_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- MARK AS READ ----
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    await db.prepare(`UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`).run(req.params.id, req.user!.userId);
    return res.json({ data: { message: 'Notification marked as read' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'NOTIFICATION_UPDATE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- MARK ALL AS READ ----
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    await db.prepare(`UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0`).run(req.user!.userId);
    return res.json({ data: { message: 'All notifications marked as read' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'NOTIFICATIONS_READ_ALL_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- DELETE NOTIFICATION ----
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    await db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.userId);
    return res.json({ data: { message: 'Notification deleted' }, meta: { requestId: req.requestId } });
  } catch (err: any) {
    return res.status(500).json({ error: { code: 'NOTIFICATION_DELETE_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ---- CREATE NOTIFICATION (INTERNAL HELPER — also used by other routes) ----
export function createNotification(userId: string, type: string, title: string, message: string, metadata: Record<string, any> = {}) {
  try {
    const db = getDb();
    Promise.resolve(
      db.prepare('INSERT INTO notifications (id, user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?, ?)')
        .run(generateId(), userId, type, title, message, JSON.stringify(metadata))
    ).catch((err: any) => console.warn('Failed to create notification:', err.message));
  } catch (err: any) {
    console.warn('Failed to create notification:', err.message);
  }
}

export default router;
