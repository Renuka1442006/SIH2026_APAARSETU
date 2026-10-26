import { Router } from 'express';
import {
  issueCredential,
  verifyCredential,
  simulateTamperCheck,
  revokeCredential,
} from '../controllers/credential.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Public endpoint for QR code / web verification
router.get('/verify', verifyCredential);

// Protected endpoints
router.post(
  '/issue',
  authenticateToken,
  requireRole([ROLES.AICTE_ADMIN, ROLES.INSTITUTION_ADMIN]),
  issueCredential
);

router.post(
  '/simulate-tamper',
  authenticateToken,
  simulateTamperCheck
);

router.post(
  '/:id/revoke',
  authenticateToken,
  requireRole([ROLES.AICTE_ADMIN]),
  revokeCredential
);

export default router;
