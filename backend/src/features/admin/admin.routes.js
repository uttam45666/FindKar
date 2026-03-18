import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateMongoIdParam } from '../../middleware/validation.middleware.js';
import * as adminController from './admin.controller.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);

router.get('/providers', adminController.getProviders);
router.patch('/providers/:id/approve', validateMongoIdParam('id'), adminController.approveProvider);
router.patch('/providers/:id/block', validateMongoIdParam('id'), adminController.blockProvider);
router.patch('/providers/:id/unblock', validateMongoIdParam('id'), adminController.unblockProvider);

router.get('/customers', adminController.getCustomers);
router.patch('/customers/:id/toggle', validateMongoIdParam('id'), adminController.toggleUserActive);

router.get('/bookings', adminController.getAllBookings);

router.get('/sos', adminController.getSOSAlerts);
router.patch('/sos/:id/resolve', validateMongoIdParam('id'), adminController.resolveSOSAlert);

export default router;
