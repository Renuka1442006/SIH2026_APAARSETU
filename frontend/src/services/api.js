import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getStoredToken() {
  return localStorage.getItem('apaarsetu_token');
}

export function setStoredToken(token) {
  localStorage.setItem('apaarsetu_token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('apaarsetu_token');
}

// Axios instance with default configuration
const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request Interceptor: Attach Bearer token
client.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error extraction
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.message;
    if (error.response && error.response.data) {
      message = error.response.data.error || error.response.data.message || message;
    }
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Authentication & User Provisioning
  login: (credentials) => client.post('/auth/login', credentials),
  forgotPassword: (data) => client.post('/auth/forgot-password', data),
  getCurrentUser: () => client.get('/auth/me'),
  getDemoAccounts: () => client.get('/auth/demo-accounts'),
  createUser: (data) => client.post('/auth/create-user', data),
  getUsers: () => client.get('/auth/users'),

  // Institutions
  getInstitutions: () => client.get('/institutions'),
  getInstitutionById: (id) => client.get(`/institutions/${id}`),
  createInstitution: (data) => client.post('/institutions', data),
  onboardInstitution: (data) => client.post('/institutions/onboard', data),
  addCourse: (institutionId, data) => client.post(`/institutions/${institutionId}/courses`, data),
  setIntakeApproval: (institutionId, data) => client.post(`/institutions/${institutionId}/intake-approvals`, data),

  // Students
  getStudents: (params = {}) => client.get('/students', { params }),
  getStudentById: (id) => client.get(`/students/${id}`),
  createStudent: (data) => client.post('/students', data),
  updateEnrolmentStatus: (studentId, enrolmentId, data) =>
    client.patch(`/students/${studentId}/enrolments/${enrolmentId}/status`, data),

  // Bulk Upload & Validation Engine
  getTemplateUrl: () => `${API_BASE}/upload/template`,
  validatePreview: (formData) =>
    client.post('/upload/validate-preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  commitBatch: (data) => client.post('/upload/commit', data),
  getUploadBatches: (institutionId) => client.get('/upload/batches', { params: { institutionId } }),
  getUploadBatchById: (id) => client.get(`/upload/batches/${id}`),

  // Verification & Review Cases (Cross-Institution Collisions)
  getReviewCases: (status, institutionId) => client.get('/review-cases', { params: { status, institutionId } }),
  scanReviewCases: () => client.post('/review-cases/scan'),
  getReviewCaseById: (id) => client.get(`/review-cases/${id}`),
  updateReviewCase: (id, data) => client.patch(`/review-cases/${id}`, data),

  // Credentials & QR Verification
  issueCredential: (data) => client.post('/credentials/issue', data),
  verifyCredential: (ref, sig) => client.get('/credentials/verify', { params: { ref, sig } }),
  simulateTamper: (data) => client.post('/credentials/simulate-tamper', data),
  revokeCredential: (id, reason) => client.post(`/credentials/${id}/revoke`, { reason }),

  // Regulatory Analytics & Intake Compliance
  getAicteDashboard: (params = {}) => client.get('/analytics/aicte-dashboard', { params }),
  getInstitutionIntake: (institutionId, academicYear) =>
    client.get(`/analytics/institution-intake/${institutionId}`, { params: { academicYear } }),

  // Audit Events
  getAuditEvents: (params = {}) => client.get('/audit-events', { params }),

  // =========================================================================
  // DEDICATED INSTITUTION ADMIN PORTAL ENDPOINTS (/api/institution/*)
  // =========================================================================
  // Dropdown Options
  getInstitutionCoursesOption: () => client.get('/institution/options/courses'),
  getInstitutionAcademicYearsOption: () => client.get('/institution/options/academic-years'),
  getInstitutionAdmissionCategoriesOption: () => client.get('/institution/options/admission-categories'),
  getInstitutionEnrollmentStatusesOption: () => client.get('/institution/options/enrollment-statuses'),

  // Dashboard
  getInstitutionDashboardStats: () => client.get('/institution/dashboard/stats'),
  getInstitutionDashboardTrends: () => client.get('/institution/dashboard/verification-trends'),
  getInstitutionDashboardDistribution: () => client.get('/institution/dashboard/status-distribution'),
  getInstitutionDashboardRecentCases: () => client.get('/institution/dashboard/recent-cases'),
  getInstitutionDashboardAlerts: () => client.get('/institution/dashboard/alerts'),

  // Students
  getInstitutionStudents: (params = {}) => client.get('/institution/students', { params }),
  getInstitutionStudentById: (id) => client.get(`/institution/students/${id}`),
  createInstitutionStudent: (data) => client.post('/institution/students', data),
  updateInstitutionStudent: (id, data) => client.patch(`/institution/students/${id}`, data),
  getInstitutionStudentDocuments: (id) => client.get(`/institution/students/${id}/documents`),
  getInstitutionStudentHistory: (id) => client.get(`/institution/students/${id}/history`),

  // Bulk Upload
  getInstitutionBulkTemplateUrl: () => `${API_BASE}/institution/bulk-upload/template`,
  validateInstitutionBulkUpload: (data) => client.post('/institution/bulk-upload/validate', data),
  commitInstitutionBulkUpload: (data) => client.post('/institution/bulk-upload/commit', data),

  // Document Verification
  uploadInstitutionDocument: (formData) =>
    client.post('/institution/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeInstitutionDocument: (id) => client.post(`/institution/documents/${id}/analyze`),
  getInstitutionDocuments: () => client.get('/institution/documents'),
  getInstitutionDocumentById: (id) => client.get(`/institution/documents/${id}`),

  // Cross-Institution Matching
  getInstitutionCrossMatches: () => client.get('/institution/cross-institution/matches'),
  getInstitutionCrossMatchById: (id) => client.get(`/institution/cross-institution/matches/${id}`),
  reviewInstitutionCrossMatch: (id, data) => client.patch(`/institution/cross-institution/matches/${id}/review`, data),

  // Admission Compliance
  getInstitutionCompliance: (params = {}) => client.get('/institution/compliance', { params }),
  getInstitutionComplianceAlerts: () => client.get('/institution/compliance/alerts'),

  // QR Credentials
  issueInstitutionQRCredential: (data) => client.post('/institution/qr-credentials', data),
  getInstitutionQRCredentials: () => client.get('/institution/qr-credentials'),
  revokeInstitutionQRCredential: (id, reason) => client.post(`/institution/qr-credentials/${id}/revoke`, { reason }),

  // Reports
  getInstitutionReportsVerification: () => client.get('/institution/reports/verification'),
  getInstitutionReportsCompliance: () => client.get('/institution/reports/compliance'),
  getInstitutionReportsCases: () => client.get('/institution/reports/cases'),
  getInstitutionReportsExportUrl: () => `${API_BASE}/institution/reports/export`,

  // Settings & Staff
  getInstitutionSettings: () => client.get('/institution/settings'),
  updateInstitutionSettings: (data) => client.patch('/institution/settings', data),
  getInstitutionStaff: () => client.get('/institution/settings/users'),
  createInstitutionStaff: (data) => client.post('/institution/settings/users', data),

  // Audit Logs
  getInstitutionAuditLogs: () => client.get('/institution/audit-logs'),
};

export default api;
