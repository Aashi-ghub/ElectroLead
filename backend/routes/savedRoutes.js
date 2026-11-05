import express from 'express';
import {
  getSavedContacts,
  saveContact,
  removeSavedContact,
} from '../controllers/savedController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate, requireRole('buyer', 'seller'));

router.get('/', getSavedContacts);
router.post('/', validate(schemas.saveContact), saveContact);
router.delete('/:contactId', removeSavedContact);

export default router;
