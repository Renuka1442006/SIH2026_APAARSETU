import { Router } from 'express';
import {
  getReviewCases,
  getReviewCaseById,
  updateReviewCase,
  scanReviewCases,
} from '../controllers/review.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getReviewCases);
router.post('/scan', scanReviewCases);
router.get('/:id', getReviewCaseById);

router.patch(
  '/:id',
  requireRole([ROLES.AICTE_ADMIN, ROLES.VERIFIER, ROLES.INSTITUTION_ADMIN]),
  updateReviewCase
);

export default router;
