import express from 'express';
import { register, login, verifyOtp, resetPassword, forgotPassword } from '../controllers/authController.js';
import { validate, schemas } from '../middleware/validation.js';
import { apiLimiter, otpLimiter, loginLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public routes
router.post('/register', apiLimiter, validate(schemas.register), register);
router.post('/login', loginLimiter, validate(schemas.login), login);
router.post('/verify-otp', otpLimiter, validate(schemas.verifyOtp), verifyOtp);
router.post('/forgot-password', otpLimiter, validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', otpLimiter, validate(schemas.resetPassword), resetPassword);

export default router;



