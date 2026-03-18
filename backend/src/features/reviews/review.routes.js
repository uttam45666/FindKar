import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateMongoIdParam } from '../../middleware/validation.middleware.js';
import * as reviewController from './review.controller.js';

const router = Router();

router.get('/provider/:providerId', validateMongoIdParam('providerId'), reviewController.getProviderReviews);

router.use(verifyToken);
router.post('/', requireRole('customer'), reviewController.submitReview);
router.post('/:id/reply', requireRole('provider'), validateMongoIdParam('id'), reviewController.replyToReview);

export default router;
