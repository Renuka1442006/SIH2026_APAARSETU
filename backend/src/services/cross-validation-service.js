import prisma from '../config/prisma.js';
import { logAuditEvent } from './audit-service.js';

/**
 * Normalizes full name for demographic matching (removes titles, extra spaces, lowercase)
 */
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(mr\.|ms\.|mrs\.|dr\.|prof\.)\s+/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
}

/**
 * Scans the database and applies all AICTE regulatory cross-validation rules:
 * Rule 1: Exact APAAR collision across different institutions in the same AY (AICTE APH Ch. VII Cl. 7.3)
 * Rule 2: Demographic collision (Exact Full Name + DOB + Gender) across different institutions
 * Rule 3: Identity Token (Aadhaar Vault Ref) duplicate across different institutions
 * Rule 4: Transfer compliance (Legitimate prior-year/surrendered transfers are excluded)
 *
 * @param {string|null} filterInstitutionId - Optional filter for institution-scoped scans
 * @returns {Promise<{ scannedEnrolments: number, detectedCollisions: number, createdCases: number, cases: Array }>}
 */
export async function scanAllCrossInstitutionCollisions(filterInstitutionId = null) {
  // 1. Fetch all active or flagged enrolments from PostgreSQL
  const enrolments = await prisma.enrolment.findMany({
    where: {
      status: { in: ['ACTIVE', 'FLAGGED'] },
    },
    include: {
      student: true,
      institution: {
        select: { id: true, name: true, code: true, state: true },
      },
      course: {
        select: { id: true, name: true, code: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const collisions = [];
  const pairKeys = new Set();

  // Helper to register a collision between two enrolments
  const registerCollision = (enrolA, enrolB, matchType, reason, severity = 'CRITICAL', matchScore = 99.8) => {
    if (enrolA.institutionId === enrolB.institutionId) return; // Intra-institution handled separately

    // If filterInstitutionId is provided, at least one of them must match
    if (filterInstitutionId) {
      if (enrolA.institutionId !== filterInstitutionId && enrolB.institutionId !== filterInstitutionId) {
        return;
      }
    }

    // Determine primary (first admitted) vs conflicting (later admitted)
    const dateA = new Date(enrolA.admissionDate || enrolA.createdAt).getTime();
    const dateB = new Date(enrolB.admissionDate || enrolB.createdAt).getTime();
    const primary = dateA <= dateB ? enrolA : enrolB;
    const conflicting = dateA <= dateB ? enrolB : enrolA;

    const pairKey = [primary.studentId, conflicting.studentId, primary.institutionId, conflicting.institutionId]
      .sort()
      .join(':');

    if (pairKeys.has(pairKey)) return;
    pairKeys.add(pairKey);

    collisions.push({
      primary,
      conflicting,
      matchType,
      reason,
      severity,
      matchScore,
    });
  };

  // Compare all active enrolment pairs
  for (let i = 0; i < enrolments.length; i++) {
    const a = enrolments[i];
    const studA = a.student;
    if (!studA) continue;

    for (let j = i + 1; j < enrolments.length; j++) {
      const b = enrolments[j];
      const studB = b.student;
      if (!studB) continue;

      // Skip if same institution
      if (a.institutionId === b.institutionId) continue;

      // Must be the same academic year to constitute concurrent dual-seat collision
      if (a.academicYear !== b.academicYear) continue;

      // RULE 1: Exact 12-digit APAAR Collision
      const apaarA = studA.apaarId ? studA.apaarId.replace(/[^0-9]/g, '') : null;
      const apaarB = studB.apaarId ? studB.apaarId.replace(/[^0-9]/g, '') : null;

      if (apaarA && apaarB && apaarA.length === 12 && apaarA === apaarB) {
        registerCollision(
          a,
          b,
          'EXACT_APAAR_COLLISION',
          `🚨 AICTE APH Chapter VII Clause 7.3 Violation: APAAR ID ${studA.apaarId} has concurrent active enrolments at ${a.institution.name} (${a.course.name}, Roll: ${a.rollNumber}) and ${b.institution.name} (${b.course.name}, Roll: ${b.rollNumber}) for AY ${a.academicYear}.`,
          'CRITICAL',
          99.8
        );
        continue; // Primary rule matched
      }

      // RULE 2: Demographic Duplicate (Exact Name + DOB + Gender)
      const nameA = normalizeName(studA.fullName);
      const nameB = normalizeName(studB.fullName);
      const dobA = formatDate(studA.dob);
      const dobB = formatDate(studB.dob);
      const genderA = studA.gender?.toUpperCase();
      const genderB = studB.gender?.toUpperCase();

      if (nameA && nameB && nameA === nameB && dobA && dobB && dobA === dobB && genderA === genderB) {
        registerCollision(
          a,
          b,
          'DEMOGRAPHIC_COLLISION',
          `⚠️ Potential Identity Typo or Dual Application: Candidate '${studA.fullName}' (DOB: ${dobA}, Gender: ${genderA}) is actively enrolled simultaneously at ${a.institution.name} and ${b.institution.name} for AY ${a.academicYear}.`,
          'HIGH',
          89.5
        );
        continue;
      }

      // RULE 3: Aadhaar Vault / Biometric Token Collision
      if (
        studA.aadhaarVaultRef &&
        studB.aadhaarVaultRef &&
        studA.aadhaarVaultRef.length > 5 &&
        studA.aadhaarVaultRef === studB.aadhaarVaultRef
      ) {
        registerCollision(
          a,
          b,
          'AADHAAR_VAULT_COLLISION',
          `🔐 Biometric / Aadhaar Vault Token Duplicate: Identical vault reference (${studA.aadhaarVaultRef}) submitted across ${a.institution.name} and ${b.institution.name}.`,
          'CRITICAL',
          98.5
        );
        continue;
      }
    }
  }

  // 2. Persist detected collisions into PostgreSQL ReviewCase & ValidationIssue tables
  let createdCount = 0;
  let caseCount = await prisma.reviewCase.count();

  for (const col of collisions) {
    const student = col.primary.student;
    const primaryInst = col.primary.institution;
    const conflictInst = col.conflicting.institution;

    // Check if an existing review case exists for this student / pair
    const existing = await prisma.reviewCase.findFirst({
      where: {
        OR: [
          {
            studentId: student.id,
            primaryInstitutionId: primaryInst.id,
            conflictingInstitutionId: conflictInst.id,
          },
          {
            studentId: col.conflicting.student.id,
            primaryInstitutionId: primaryInst.id,
            conflictingInstitutionId: conflictInst.id,
          },
        ],
      },
    });

    if (!existing) {
      caseCount++;
      const caseNumber = `RC-2026-${String(caseCount).padStart(4, '0')}`;

      await prisma.reviewCase.create({
        data: {
          caseNumber,
          studentId: student.id,
          primaryInstitutionId: primaryInst.id,
          conflictingInstitutionId: conflictInst.id,
          reason: col.reason,
          status: 'UNDER_REVIEW',
        },
      });

      // Create validation issue
      await prisma.validationIssue.create({
        data: {
          studentId: student.id,
          apaarId: student.apaarId || 'N/A',
          studentName: student.fullName,
          issueType: 'CROSS_INSTITUTION_DUPLICATE',
          severity: col.severity === 'CRITICAL' ? 'ERROR' : 'WARNING',
          message: col.reason,
          details: JSON.stringify({
            primaryInstitutionId: primaryInst.id,
            primaryInstitutionName: primaryInst.name,
            conflictingInstitutionId: conflictInst.id,
            conflictingInstitutionName: conflictInst.name,
            matchType: col.matchType,
            matchScore: col.matchScore,
          }),
        },
      });

      // Flag the conflicting enrolment to prevent unauthorized dual graduation
      await prisma.enrolment.update({
        where: { id: col.conflicting.id },
        data: { status: 'FLAGGED' },
      });

      createdCount++;
    }
  }

  // 3. Query and return all current review cases from PostgreSQL
  const caseWhere = {};
  if (filterInstitutionId) {
    caseWhere.OR = [
      { primaryInstitutionId: filterInstitutionId },
      { conflictingInstitutionId: filterInstitutionId },
    ];
  }

  const persistedCases = await prisma.reviewCase.findMany({
    where: caseWhere,
    include: {
      student: {
        include: {
          enrolments: {
            include: { institution: true, course: true },
          },
        },
      },
      primaryInstitution: true,
      conflictingInstitution: true,
      reviewedByUser: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    scannedEnrolments: enrolments.length,
    detectedCollisions: collisions.length,
    createdCases: createdCount,
    cases: persistedCases,
  };
}
