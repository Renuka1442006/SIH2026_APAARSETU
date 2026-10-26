import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateEnrolmentStatus,
} from '../controllers/student.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getStudents);
router.get('/:id', getStudentById);

router.post(
  '/',
  requireRole([ROLES.AICTE_ADMIN, ROLES.INSTITUTION_ADMIN]),
  createStudent
);

router.patch(
  '/:studentId/enrolments/:enrolmentId/status',
  requireRole([ROLES.AICTE_ADMIN, ROLES.INSTITUTION_ADMIN]),
  updateEnrolmentStatus
);

export default router;
