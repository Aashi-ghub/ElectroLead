import express from 'express';
import { createEnquiry, getMyEnquiries, deleteEnquiry } from '../controllers/enquiryController.js';
import { getEnquiryQuotations } from '../controllers/quotationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require buyer role
router.use(authenticate, requireRole('buyer'));

router.post('/', validate(schemas.createEnquiry), createEnquiry);
router.get('/my-enquiries', getMyEnquiries);
router.get('/:id/quotations', getEnquiryQuotations);
router.delete('/:id', deleteEnquiry);

export default router;



