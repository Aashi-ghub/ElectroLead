import express from 'express';
import { getMarketplaceSummary } from '../controllers/publicController.js';

const router = express.Router();

// Unauthenticated by design - this feeds the public marketing pages. The
// controller restricts the columns; do not add an authenticated route here.
router.get('/summary', getMarketplaceSummary);

export default router;
