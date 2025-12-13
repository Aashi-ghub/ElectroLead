import express from 'express';
import { createSubscriptionOrder, verifySubscription } from '../controllers/subscriptionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require seller role
router.use(authenticate, requireRole('seller'));

router.post('/create-order', createSubscriptionOrder);
router.post('/verify', verifySubscription);

export default router;
