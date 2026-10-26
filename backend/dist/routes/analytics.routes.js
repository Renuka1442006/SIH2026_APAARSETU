import { Router } from 'express';
import { getAicteDashboard, getInstitutionIntakeMetrics, } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.use(authenticateToken);
router.get('/aicte-dashboard', getAicteDashboard);
router.get('/institution-intake/:institutionId', getInstitutionIntakeMetrics);
export default router;
