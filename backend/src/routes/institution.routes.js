import { Router } from 'express';
import {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  onboardInstitutionWithAdmin,
  addCourse,
  setIntakeApproval,
} from '../controllers/institution.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getInstitutions);
router.get('/:id', getInstitutionById);

// AICTE Admin authority to create an institution
router.post(
  '/',
  requireRole([ROLES.AICTE_ADMIN]),
  createInstitution
);

// AICTE Admin authority to onboard institution with initial admin credentials
router.post(
  '/onboard',
  requireRole([ROLES.AICTE_ADMIN]),
  onboardInstitutionWithAdmin
);

// Add course (AICTE admin or Institution Admin for own institution)
router.post(
  '/:institutionId/courses',
  requireRole([ROLES.AICTE_ADMIN, ROLES.INSTITUTION_ADMIN]),
  addCourse
);

// Set intake approval (Only AICTE Admin can approve or set sanctions)
router.post(
  '/:institutionId/intake-approvals',
  requireRole([ROLES.AICTE_ADMIN]),
  setIntakeApproval
);

export default router;
