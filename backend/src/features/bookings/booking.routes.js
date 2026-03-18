import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateMongoIdParam } from '../../middleware/validation.middleware.js';
import * as bookingController from './booking.controller.js';

const router = Router();
router.use(verifyToken);

router.get('/active', bookingController.getActiveBooking);
router.get('/my', requireRole('customer'), bookingController.getMyBookings);
router.post('/', requireRole('customer'), bookingController.createBooking);
router.delete('/:id/cancel', requireRole('customer'), validateMongoIdParam('id'), bookingController.cancelBooking);
router.post('/:id/sos', requireRole('customer'), validateMongoIdParam('id'), bookingController.triggerSOS);

router.get('/provider', requireRole('provider'), bookingController.getProviderBookings);
router.patch('/:id/status', requireRole('provider'), validateMongoIdParam('id'), bookingController.updateStatus);
router.post('/:id/verify-otp', requireRole('provider'), validateMongoIdParam('id'), bookingController.verifyOTP);

router.get('/:id', validateMongoIdParam('id'), bookingController.getBookingById);

export default router;
