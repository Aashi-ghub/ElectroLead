import express from 'express';
import { getUsers, approveKyc, getAdminEnquiries, suspendUser, getSubscriptions, getUserDocuments } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateUuidParam } from '../middleware/validateParams.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, requireRole('admin'));

router.get('/users', getUsers);
router.get('/users/:id/documents', validateUuidParam('id'), getUserDocuments);
router.post('/users/:id/approve-kyc', validateUuidParam('id'), approveKyc);
router.get('/enquiries', getAdminEnquiries);
router.post('/users/:id/suspend', validateUuidParam('id'), suspendUser);
router.get('/subscriptions', getSubscriptions);

export default router;



