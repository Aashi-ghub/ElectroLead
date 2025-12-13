import express from 'express';
import { getAvailableEnquiries } from '../controllers/sellerEnquiryController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Seller route for viewing available enquiries (subscription-based filtering)
router.get('/', authenticate, requireRole('seller'), getAvailableEnquiries);

export default router;
