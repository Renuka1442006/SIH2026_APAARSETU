import { Router } from 'express';
import multer from 'multer';
import { getCsvTemplate, validateAndPreview, commitBatch, getUploadBatches, getUploadBatchById, } from '../controllers/upload.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';
const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});
// CSV template is accessible without auth so institutions can download sample directly
router.get('/template', getCsvTemplate);
router.use(authenticateToken);
router.post('/validate-preview', requireRole([ROLES.AICTE_ADMIN, ROLES.INSTITUTION_ADMIN]), upload.single('file'), validateAndPreview);
router.post('/commit', requireRole([ROLES.AICTE_ADMIN, ROLES.INSTITUTION_ADMIN]), commitBatch);
router.get('/batches', getUploadBatches);
router.get('/batches/:id', getUploadBatchById);
export default router;
