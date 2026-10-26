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
};

export default api;
