import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { upload } from '../../config/cloudinary.js';
import * as userController from './user.controller.js';

const router = Router();

router.use(verifyToken);
router.get('/me', userController.getMyProfile);
router.put('/me', userController.updateMyProfile);
router.post('/me/avatar', upload.single('image'), userController.uploadProfileImage);

export default router;
