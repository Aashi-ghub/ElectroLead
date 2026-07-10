import express from 'express';
import { createEnquiry, getMyEnquiries, getEnquiryById, deleteEnquiry } from '../controllers/enquiryController.js';
import { getEnquiryQuotations } from '../controllers/quotationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Per-route middleware (not router.use) - this router shares the /api/enquiries
// prefix with sellerEnquiryRoutes.js, and a blanket router.use() gate would
// intercept every request on that prefix (including seller requests) before
// Express can fall through to the other router.
router.post('/', authenticate, requireRole('buyer'), validate(schemas.createEnquiry), createEnquiry);
router.get('/my-enquiries', authenticate, requireRole('buyer'), getMyEnquiries);
router.get('/:id/quotations', authenticate, requireRole('buyer'), getEnquiryQuotations);
router.get('/:id', authenticate, requireRole('buyer'), getEnquiryById);
router.delete('/:id', authenticate, requireRole('buyer'), deleteEnquiry);

export default router;



