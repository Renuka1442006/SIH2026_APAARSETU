import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';
import {
  // 1. Dropdown Options for Add Student
  getCoursesOption,
  getAcademicYearsOption,
  getAdmissionCategoriesOption,
  getEnrollmentStatusesOption,

  // 2. Dashboard
  getDashboardStats,
  getDashboardVerificationTrends,
  getDashboardStatusDistribution,
  getDashboardRecentCases,
  getDashboardAlerts,

  // 3. Student Records
  getInstitutionStudents,
  getInstitutionStudentById,
  createInstitutionStudent,
  updateInstitutionStudent,
  getStudentDocuments,
  getStudentHistory,

  // 4. Bulk CSV Upload
  getBulkTemplate,
  validateBulkUpload,
  commitBulkUpload,

  // 5. Document Verification
  uploadDocument,
  analyzeDocument,
  getDocuments,
  getDocumentById,

  // 6. Cross-Institution Matching
  getCrossInstitutionMatches,
  getCrossInstitutionMatchById,
  reviewCrossInstitutionMatch,

  // 7. Admission Compliance
  getCompliance,
  getComplianceAlerts,

  // 8. QR Credentials
  issueQRCredential,
  getQRCredentials,
  revokeQRCredential,
  verifyQR,

  // 9. Reports
  getReportsVerification,
  getReportsCompliance,
  getReportsCases,
  getReportsExport,

  // 10. Settings & Staff
  getSettings,
  updateSettings,
  getInstitutionUsers,
  createInstitutionUser,

  // 11. Audit Logs
  getAuditLogs,
} from '../controllers/institution-portal.controller.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Public/Open Endpoints for Verification & Template Download
router.get('/bulk-upload/template', getBulkTemplate);
router.get('/qr/verify', verifyQR);
router.post('/qr/verify', verifyQR);

// Protect all other institution endpoints with JWT & RBAC
router.use(authenticateToken);
router.use(requireRole([ROLES.INSTITUTION_ADMIN, ROLES.AICTE_ADMIN]));

// 1. Add Student Dropdown Options
router.get('/options/courses', getCoursesOption);
router.get('/options/academic-years', getAcademicYearsOption);
router.get('/options/admission-categories', getAdmissionCategoriesOption);
router.get('/options/enrollment-statuses', getEnrollmentStatusesOption);

// 2. Dashboard Endpoints
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/verification-trends', getDashboardVerificationTrends);
router.get('/dashboard/status-distribution', getDashboardStatusDistribution);
router.get('/dashboard/recent-cases', getDashboardRecentCases);
router.get('/dashboard/alerts', getDashboardAlerts);

// 3. Student Records
router.get('/students', getInstitutionStudents);
router.get('/students/:id', getInstitutionStudentById);
router.post('/students', createInstitutionStudent);
router.patch('/students/:id', updateInstitutionStudent);
router.get('/students/:id/documents', getStudentDocuments);
router.get('/students/:id/history', getStudentHistory);

// 4. Bulk CSV Upload
router.post('/bulk-upload/validate', validateBulkUpload);
router.post('/bulk-upload/commit', commitBulkUpload);

// 5. Document Verification
router.post('/documents/upload', upload.single('file'), uploadDocument);
router.post('/documents/:id/analyze', analyzeDocument);
router.get('/documents', getDocuments);
router.get('/documents/:id', getDocumentById);
router.get('/documents/:id/results', getDocumentById);

// 6. Cross-Institution Matching
router.get('/cross-institution/matches', getCrossInstitutionMatches);
router.get('/cross-institution/matches/:id', getCrossInstitutionMatchById);
router.patch('/cross-institution/matches/:id/review', reviewCrossInstitutionMatch);

// 7. Admission Compliance
router.get('/compliance', getCompliance);
router.get('/compliance/alerts', getComplianceAlerts);

// 8. QR Credentials
router.post('/qr-credentials', issueQRCredential);
router.get('/qr-credentials', getQRCredentials);
router.post('/qr-credentials/:id/revoke', revokeQRCredential);

// 9. Reports & Exports
router.get('/reports/verification', getReportsVerification);
router.get('/reports/compliance', getReportsCompliance);
router.get('/reports/cases', getReportsCases);
router.get('/reports/export', getReportsExport);

// 10. Institution Settings & Staff
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.get('/settings/users', getInstitutionUsers);
router.post('/settings/users', createInstitutionUser);

// 11. Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;
