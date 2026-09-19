import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import '../types';

const router = Router();
router.use(authenticate);

/* ── GET /api/notifications — User notifications & unread count ────── */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

/* ── PATCH /api/notifications/:id/read — Mark single as read ───────── */
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });

    res.json({ success: true, count: notification.count });
  } catch (error) {
    next(error);
  }
});

/* ── POST /api/notifications/read-all — Mark all as read ───────────── */
router.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

export default router;
