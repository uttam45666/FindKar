import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { validateMongoIdParam } from '../../middleware/validation.middleware.js';
import * as notificationController from './notification.controller.js';

const router = Router();
router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', validateMongoIdParam('id'), notificationController.markRead);
router.patch('/mark-all-read', notificationController.markAllRead);

export default router;
