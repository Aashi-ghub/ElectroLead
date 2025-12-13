import express from 'express';
import { createQuotation, getMyQuotations } from '../controllers/quotationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Seller routes
router.post('/enquiries/:id/quote', authenticate, requireRole('seller'), validate(schemas.createQuotation), createQuotation);
router.get('/my-quotations', authenticate, requireRole('seller'), getMyQuotations);

export default router;
