import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { upload } from '../../config/cloudinary.js';
import { validateMongoIdParam } from '../../middleware/validation.middleware.js';
import * as providerController from './provider.controller.js';

const router = Router();

// Public routes
router.get('/', providerController.getListings);
router.get('/:id', validateMongoIdParam('id'), providerController.getProviderById);
router.post('/:id/share', validateMongoIdParam('id'), providerController.incrementShare);

// Protected provider routes
router.use(verifyToken);
router.get('/me/profile', requireRole('provider'), providerController.getMyProfile);
router.post('/me/setup', requireRole('provider'), providerController.setupProfile);
router.put('/me/working-hours', requireRole('provider'), providerController.updateWorkingHours);
router.patch('/me/availability', requireRole('provider'), providerController.toggleAvailability);
router.post('/me/services', requireRole('provider'), providerController.addService);
router.put('/me/services/:serviceId', requireRole('provider'), validateMongoIdParam('serviceId'), providerController.updateService);
router.delete('/me/services/:serviceId', requireRole('provider'), validateMongoIdParam('serviceId'), providerController.deleteService);
router.post('/me/images', requireRole('provider'), upload.array('images', 5), providerController.uploadImages);
router.post('/:id/vouch', requireRole('provider'), validateMongoIdParam('id'), providerController.vouchForProvider);

export default router;
