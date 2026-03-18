import { Router } from 'express';
import * as authController from './auth.controller.js';
import {
	checkUsernameValidation,
	sendOtpValidation,
	registerValidation,
	loginValidation,
	verifyOtpValidation,
	verifyForResetValidation,
	resetPasswordValidation,
	logoutValidation,
} from './auth.validation.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/check-username/:username', checkUsernameValidation, validateRequest, authController.checkUsername);
router.post('/send-otp', sendOtpValidation, validateRequest, authController.sendOTP);
router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.loginEmail);
router.post('/verify-otp', verifyOtpValidation, validateRequest, authController.verifyOTP);
router.post('/verify-for-reset', verifyForResetValidation, validateRequest, authController.verifyForReset);
router.post('/reset-password', resetPasswordValidation, validateRequest, authController.resetPassword);
router.get('/sessions', verifyToken, authController.listSessions);
router.post('/logout', verifyToken, logoutValidation, validateRequest, authController.logout);

export default router;
