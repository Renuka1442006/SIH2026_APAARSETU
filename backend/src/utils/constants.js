export const ROLES = {
  AICTE_ADMIN: 'AICTE_ADMIN',
  INSTITUTION_ADMIN: 'INSTITUTION_ADMIN',
  VERIFIER: 'VERIFIER',
};

export const APAAR_STATUS = {
  SIMULATED_VERIFIED: 'SIMULATED_VERIFIED',
  FORMAT_VALID_TEST: 'FORMAT_VALID_TEST',
  UNVERIFIED: 'UNVERIFIED',
  MISSING: 'MISSING',
};

export const ENROLMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  PROMOTED: 'PROMOTED',
  TRANSFERRED: 'TRANSFERRED',
  DROPPED: 'DROPPED',
  GRADUATED: 'GRADUATED',
  FLAGGED: 'FLAGGED',
};

export const ISSUE_TYPES = {
  MISSING_APAAR: 'MISSING_APAAR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  FILE_DUPLICATE: 'FILE_DUPLICATE',
  DB_DUPLICATE: 'DB_DUPLICATE',
  CROSS_INSTITUTION_DUPLICATE: 'CROSS_INSTITUTION_DUPLICATE',
  INTAKE_EXCEEDED: 'INTAKE_EXCEEDED',
  MISSING_FIELD: 'MISSING_FIELD',
  CONFLICTING_DATA: 'CONFLICTING_DATA',
};

export const REVIEW_STATUS = {
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  REQUIRING_CORRECTION: 'REQUIRING_CORRECTION',
  REJECTED: 'REJECTED',
};

export const SUPERNUMERARY_CATEGORIES = [
  'NONE',
  'TFW',           // Tuition Fee Waiver (5%)
  'PMSSS',         // Prime Minister's Special Scholarship Scheme for J&K/Ladakh
  'JK_MIGRANT',    // Kashmiri Migrants
  'FOREIGN_NATIONAL', // Foreign Nationals / PIO / CIWG
  'CW',            // Children/Widows of Armed Forces
  'SPORTS_DEFENCE',
];

// 12-digit Indian APAAR ID format: e.g. "1234-5678-9012" or "123456789012"
export const APAAR_REGEX = /^(?:\d{4}-\d{4}-\d{4}|\d{12})$/;

export function normalizeApaar(raw) {
  if (!raw) return null;
  const digitsOnly = String(raw).replace(/\D/g, '');
  if (digitsOnly.length !== 12) return String(raw).trim();
  return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8, 12)}`;
}

export function maskApaar(apaar) {
  if (!apaar) return 'N/A';
  const clean = String(apaar).replace(/\D/g, '');
  if (clean.length === 12) {
    return `XXXX-XXXX-${clean.slice(8, 12)}`;
  }
  return 'XXXX-XXXX-XXXX';
}
