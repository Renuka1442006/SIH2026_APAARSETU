import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ROLES, REVIEW_STATUS } from '../utils/constants.js';
import { logAuditEvent } from '../services/audit-service.js';
import { scanAllCrossInstitutionCollisions } from '../services/cross-validation-service.js';

/**
 * Enriches review case with detailed primary and conflicting enrolments from PostgreSQL
 */
async function enrichCaseWithEnrolments(c) {
  let conflictingEnrolment = null;

  if (c.conflictingInstitutionId) {
    // 1. Try to find conflicting enrolment attached to the same student record
    conflictingEnrolment = c.student?.enrolments?.find(
      (e) => e.institutionId === c.conflictingInstitutionId
    );

    // 2. If separate Student row exists with the same APAAR identifier, find that enrolment
    if (!conflictingEnrolment && c.student?.apaarId) {
      conflictingEnrolment = await prisma.enrolment.findFirst({
        where: {
          institutionId: c.conflictingInstitutionId,
          student: { apaarId: c.student.apaarId },
        },
        include: {
          institution: true,
          course: true,
        },
      });
    }

    // 3. Fallback: find by matching full name at the conflicting institution
    if (!conflictingEnrolment && c.student?.fullName) {
      conflictingEnrolment = await prisma.enrolment.findFirst({
        where: {
          institutionId: c.conflictingInstitutionId,
          student: { fullName: c.student.fullName },
        },
        include: {
          institution: true,
          course: true,
        },
      });
    }
  }

  const primaryEnrolment =
    c.student?.enrolments?.find((e) => e.institutionId === c.primaryInstitutionId) ||
    c.student?.enrolments?.[0] ||
    null;

  return {
    ...c,
    primaryEnrolment,
    conflictingEnrolment,
  };
}

export async function getReviewCases(req, res) {
  try {
    const user = req.user;
    const { status, institutionId } = req.query;

    const where = {};

    if (status) {
      where.status = String(status);
    }

    let filterInstitutionId = null;
    if (user?.role === ROLES.INSTITUTION_ADMIN) {
      filterInstitutionId = user.institutionId;
      where.OR = [
        { primaryInstitutionId: user.institutionId },
        { conflictingInstitutionId: user.institutionId },
      ];
    } else if (institutionId) {
      filterInstitutionId = String(institutionId);
      where.OR = [
        { primaryInstitutionId: String(institutionId) },
        { conflictingInstitutionId: String(institutionId) },
      ];
    }

    let cases = await prisma.reviewCase.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            apaarId: true,
            apaarStatus: true,
            gender: true,
            dob: true,
            enrolments: {
              include: {
                institution: true,
                course: true,
              },
            },
          },
        },
        primaryInstitution: {
          select: { id: true, name: true, code: true, state: true },
        },
        conflictingInstitution: {
          select: { id: true, name: true, code: true, state: true },
        },
        reviewedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no cases exist in the database, automatically trigger an initial scan of active database records
    if (cases.length === 0) {
      const scanResult = await scanAllCrossInstitutionCollisions(filterInstitutionId);
      if (scanResult.createdCases > 0) {
        cases = await prisma.reviewCase.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                apaarId: true,
                apaarStatus: true,
                gender: true,
                dob: true,
                enrolments: {
                  include: {
                    institution: true,
                    course: true,
                  },
                },
              },
            },
            primaryInstitution: {
              select: { id: true, name: true, code: true, state: true },
            },
            conflictingInstitution: {
              select: { id: true, name: true, code: true, state: true },
            },
            reviewedByUser: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    const enriched = await Promise.all(cases.map(enrichCaseWithEnrolments));
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching review cases:', error);
    res.status(500).json({ error: 'Failed to fetch review cases.' });
  }
}

/**
 * Explicit scan endpoint to re-validate the entire database for collisions
 */
export async function scanReviewCases(req, res) {
  try {
    const user = req.user;
    const filterInstitutionId = user?.role === ROLES.INSTITUTION_ADMIN ? user.institutionId : null;

    const result = await scanAllCrossInstitutionCollisions(filterInstitutionId);

    await logAuditEvent({
      userId: user?.userId,
      institutionId: filterInstitutionId,
      action: 'NATIONAL_CROSS_VALIDATION_SCAN',
      entityType: 'ReviewCase',
      details: {
        scannedEnrolments: result.scannedEnrolments,
        detectedCollisions: result.detectedCollisions,
        createdCases: result.createdCases,
      },
    });

    const enriched = await Promise.all(result.cases.map(enrichCaseWithEnrolments));

    res.json({
      success: true,
      message: `Cross-validation scan complete. ${result.scannedEnrolments} enrolments checked, ${result.detectedCollisions} collisions detected (${result.createdCases} new dockets created).`,
      scannedEnrolments: result.scannedEnrolments,
      detectedCollisions: result.detectedCollisions,
      createdCases: result.createdCases,
      cases: enriched,
    });
  } catch (error) {
    console.error('Error executing cross-validation scan:', error);
    res.status(500).json({ error: 'Failed to execute cross-validation scan.' });
  }
}

export async function getReviewCaseById(req, res) {
  try {
    const id = String(req.params.id);
    const user = req.user;

    const reviewCase = await prisma.reviewCase.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            enrolments: {
              include: {
                institution: true,
                course: true,
              },
            },
            validationIssues: true,
          },
        },
        primaryInstitution: true,
        conflictingInstitution: true,
        reviewedByUser: true,
      },
    });

    if (!reviewCase) {
      return res.status(404).json({ error: 'Review case not found.' });
    }

    if (
      user?.role === ROLES.INSTITUTION_ADMIN &&
      reviewCase.primaryInstitutionId !== user.institutionId &&
      reviewCase.conflictingInstitutionId !== user.institutionId
    ) {
      return res.status(403).json({ error: 'Access denied to this review case.' });
    }

    res.json(reviewCase);
  } catch (error) {
    console.error('Error fetching review case by id:', error);
    res.status(500).json({ error: 'Failed to fetch review case.' });
  }
}

const updateCaseSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'REQUIRING_CORRECTION', 'REJECTED']),
  reviewerRemarks: z.string().min(3),
});

export async function updateReviewCase(req, res) {
  try {
    const id = String(req.params.id);
    const user = req.user;

    const parse = updateCaseSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const { status, reviewerRemarks } = parse.data;

    const existingCase = await prisma.reviewCase.findUnique({
      where: { id },
    });

    if (!existingCase) {
      return res.status(404).json({ error: 'Review case not found.' });
    }

    const updated = await prisma.reviewCase.update({
      where: { id },
      data: {
        status,
        reviewerRemarks,
        reviewedByUserId: user?.userId,
        resolvedAt: status === REVIEW_STATUS.RESOLVED ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        student: true,
        primaryInstitution: true,
        conflictingInstitution: true,
      },
    });

    if (status === REVIEW_STATUS.RESOLVED) {
      await prisma.student.update({
        where: { id: updated.studentId },
        data: { apaarStatus: 'SIMULATED_VERIFIED' },
      });

      await prisma.enrolment.updateMany({
        where: { studentId: updated.studentId, status: 'FLAGGED' },
        data: { status: 'ACTIVE' },
      });
    }

    await logAuditEvent({
      userId: user?.userId,
      institutionId: updated.primaryInstitutionId,
      action: 'REVIEW_CASE_UPDATED',
      entityType: 'ReviewCase',
      entityId: id,
      details: {
        previousStatus: existingCase.status,
        newStatus: status,
        remarks: reviewerRemarks,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating review case:', error);
    res.status(500).json({ error: 'Failed to update review case.' });
  }
}
