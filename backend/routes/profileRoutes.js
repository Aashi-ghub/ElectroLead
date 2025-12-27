import express from 'express';
import { getProfile, updateProfile, uploadKyc } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getProfile);
router.put('/', validate(schemas.updateProfile), updateProfile);
router.post('/upload-kyc', uploadKyc);

export default router;



