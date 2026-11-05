import express from 'express';
import {
  getConversations,
  getThread,
  sendMessage,
  getUnreadCount,
} from '../controllers/messageController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Messaging is buyer <-> seller only; admins have no thread of their own.
router.use(authenticate, requireRole('buyer', 'seller'));

router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/thread', getThread);
router.post('/', validate(schemas.sendMessage), sendMessage);

export default router;
