import { Router } from 'express';
import {
  getReviewCases,
  getReviewCaseById,
  updateReviewCase,
} from '../controllers/review.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getReviewCases);
router.get('/:id', getReviewCaseById);

router.patch(
  '/:id',
  requireRole([ROLES.AICTE_ADMIN, ROLES.VERIFIER]),
  updateReviewCase
);

export default router;
