import Papa from 'papaparse';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { validateStudentBatch } from '../services/validation-engine.js';
import { ROLES, normalizeApaar } from '../utils/constants.js';
import { logAuditEvent } from '../services/audit-service.js';

export function getCsvTemplate(_req, res) {
  const headers = [
    'fullName',
    'gender',
    'dob',
    'email',
    'phone',
    'apaarId',
    'courseCode',
    'academicYear',
    'rollNumber',
    'socialCategory',
    'nriCategory',
    'ociStatus',
    'foreignNational',
    'supernumeraryCategory',
  ];

  const sampleRows = [
    [
      'Aarav Sharma',
      'MALE',
      '2004-05-14',
      'aarav.sharma@example.in',
      '9876543210',
      '2026-9811-3001',
      'BT-CSE',
      '2024-25',
      'IITD-2024-CSE-001',
      'GENERAL',
      'false',
      'false',
      'false',
      'NONE',
    ],
    [
      'Diya Patel',
      'FEMALE',
      '2005-02-28',
      'diya.p@example.in',
      '9823456781',
      '2026-9811-3002',
      'BT-CSE',
      '2024-25',
      'IITD-2024-CSE-002',
      'OBC',
      'false',
      'false',
      'false',
      'TFW',
    ],
    [
      'Tenzin Dorjee',
      'MALE',
      '2003-11-19',
      'tenzin.d@example.in',
      '9811223344',
      '2026-9811-3003',
      'BT-ECE',
      '2024-25',
      'IITD-2024-ECE-015',
      'ST',
      'false',
      'false',
      'false',
      'PMSSS',
    ],
  ];

  const csv = Papa.unparse({
    fields: headers,
    data: sampleRows,
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="AICTE_Student_Admission_Template.csv"');
  res.status(200).send(csv);
}

export async function validateAndPreview(req, res) {
  try {
    const user = req.user;
    const { institutionId, academicYear } = req.body;

    const targetInstitutionId = user?.role === ROLES.INSTITUTION_ADMIN ? user.institutionId : institutionId;

    if (!targetInstitutionId) {
      return res.status(400).json({ error: 'Institution ID is required.' });
    }

    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year (e.g. 2024-25) is required.' });
    }

    let rows = [];

    // Check if file was uploaded via multer or sent as JSON rows
    if (req.file) {
      const csvString = req.file.buffer.toString('utf-8');
      const parsed = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      });

      if (parsed.errors.length > 0 && parsed.data.length === 0) {
        return res.status(400).json({ error: 'Failed to parse CSV file', details: parsed.errors });
      }

      rows = parsed.data.map((r, idx) => ({
        rowNumber: idx + 1,
        fullName: r.fullName || r.name || r['Student Name'] || '',
        gender: (r.gender || r.Gender || 'MALE').toUpperCase(),
        dob: r.dob || r.DOB || r['Date of Birth'] || '',
        email: r.email || r.Email || '',
        phone: r.phone || r.Phone || '',
        apaarId: r.apaarId || r.APAAR || r['APAAR ID'] || '',
        courseCode: (r.courseCode || r.course || r['Course Code'] || '').toUpperCase(),
        academicYear: r.academicYear || academicYear,
        rollNumber: r.rollNumber || r.roll || r['Roll No'] || '',
        socialCategory: (r.socialCategory || r.category || 'GENERAL').toUpperCase(),
        nriCategory: r.nriCategory || false,
        ociStatus: r.ociStatus || false,
        foreignNational: r.foreignNational || false,
        supernumeraryCategory: r.supernumeraryCategory || 'NONE',
      }));
    } else if (req.body.rows && Array.isArray(req.body.rows)) {
      rows = req.body.rows.map((r, idx) => ({
        rowNumber: r.rowNumber || idx + 1,
        ...r,
      }));
    } else {
      return res.status(400).json({ error: 'No CSV file or rows provided for validation.' });
    }

    const validationResult = await validateStudentBatch(targetInstitutionId, academicYear, rows);

    res.json(validationResult);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Error processing validation preview.' });
  }
}

export async function commitBatch(req, res) {
  try {
    const user = req.user;
    const { institutionId, academicYear, fileName = 'Bulk_Upload.csv', rows } = req.body;

    let targetInstitutionId = user?.role === ROLES.INSTITUTION_ADMIN ? user.institutionId : institutionId;

    if (!targetInstitutionId) {
      const firstInst = await prisma.institution.findFirst({ select: { id: true } });
      targetInstitutionId = firstInst?.id;
    }

    if (!targetInstitutionId) {
      return res.status(400).json({ error: 'Institution ID is required.' });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No student rows provided to commit.' });
    }

    // Re-run validation to ensure data integrity at commit time
    const validationResult = await validateStudentBatch(targetInstitutionId, academicYear, rows);

    // Filter only rows without blocking errors
    const validRows = validationResult.processedRows.filter((r) => !r.hasErrors);

    if (validRows.length === 0) {
      return res.status(400).json({
        error: 'No valid rows found to commit. All rows contain errors. Please review and correct issues.',
        validationResult,
      });
    }

    // Run transaction to create batch, students, enrolments and issues
    // Explicit timeout (60s) and maxWait (20s) prevents Prisma P2028 transaction timeout over remote DB poolers
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Create UploadBatch
        const uploadBatch = await tx.uploadBatch.create({
          data: {
            institutionId: targetInstitutionId,
            academicYear,
            fileName,
            totalRows: rows.length,
            acceptedRows: validRows.length,
            rejectedRows: validationResult.rejectedRows,
            warningRows: validationResult.warningRows,
            status: 'COMMITTED',
            uploadedByUserId: user.userId,
            summary: JSON.stringify({
              accepted: validRows.length,
              rejected: validationResult.rejectedRows,
              warnings: validationResult.warningRows,
              intakeAnalysis: validationResult.intakeAnalysis,
            }),
          },
        });

        // 2. Insert valid students and enrolments in bulk
        const studentRecords = [];
        const enrolmentRecords = [];

        for (const row of validRows) {
          const studentId = crypto.randomUUID();
          studentRecords.push({
            id: studentId,
            fullName: row.fullName,
            gender: row.gender,
            dob: new Date(row.dob),
            email: row.email || null,
            phone: row.phone || null,
            apaarId: row.normalizedApaar || null,
            apaarStatus: row.normalizedApaar ? 'FORMAT_VALID_TEST' : 'MISSING',
            socialCategory: row.socialCategory || 'GENERAL',
            nriCategory: String(row.nriCategory).toLowerCase() === 'true',
            ociStatus: String(row.ociStatus).toLowerCase() === 'true',
            foreignNational: String(row.foreignNational).toLowerCase() === 'true',
            supernumeraryCategory: row.supernumeraryCategory || 'NONE',
            currentInstitutionId: targetInstitutionId,
            aadhaarVaultRef: `AV-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
          });

          enrolmentRecords.push({
            id: crypto.randomUUID(),
            studentId,
            institutionId: targetInstitutionId,
            courseId: row.courseId,
            academicYear,
            rollNumber: row.rollNumber,
            status: 'ACTIVE',
            isSupernumerary: Boolean(row.isSupernumerary),
            supernumeraryQuotaType: row.isSupernumerary ? row.supernumeraryCategory : null,
          });
        }

        if (studentRecords.length > 0) {
          await tx.student.createMany({ data: studentRecords });
          await tx.enrolment.createMany({ data: enrolmentRecords });
        }

        // 3. Record validation issues in database for audit & review in bulk
        if (validationResult.issues && validationResult.issues.length > 0) {
          const issueRecords = validationResult.issues.map((issue) => ({
            id: crypto.randomUUID(),
            uploadBatchId: uploadBatch.id,
            rowNumber: issue.rowNumber || null,
            apaarId: issue.apaarId || null,
            studentName: issue.studentName || null,
            issueType: issue.issueType,
            severity: issue.severity,
            message: issue.message,
            details: issue.details ? JSON.stringify(issue.details) : null,
          }));

          await tx.validationIssue.createMany({
            data: issueRecords,
          });
        }

        // 4. If cross-institution duplicate detected, also spawn a ReviewCase!
        const crossDuplicates = (validationResult.issues || []).filter(
          (issue) => issue.issueType === 'CROSS_INSTITUTION_DUPLICATE' && issue.details?.conflictingInstitutionId
        );

        if (crossDuplicates.length > 0) {
          let caseCount = await tx.reviewCase.count();
          for (const issue of crossDuplicates) {
            const conflictStudent = await tx.student.findFirst({
              where: { apaarId: issue.apaarId },
            });

            if (conflictStudent) {
              caseCount++;
              const caseNumber = `RC-2026-${String(caseCount).padStart(4, '0')}`;
              await tx.reviewCase.create({
                data: {
                  caseNumber,
                  studentId: conflictStudent.id,
                  primaryInstitutionId: targetInstitutionId,
                  conflictingInstitutionId: issue.details.conflictingInstitutionId,
                  reason: `Bulk upload collision: APAAR ${issue.apaarId} reported at ${issue.details.conflictingInstitutionName}.`,
                  status: 'UNDER_REVIEW',
                },
              });
            }
          }
        }

        return { uploadBatch, studentCount: studentRecords.length };
      },
      {
        maxWait: 20000,
        timeout: 60000,
      }
    );

    await logAuditEvent({
      userId: user?.userId,
      institutionId: targetInstitutionId,
      action: 'BULK_UPLOAD_COMMITTED',
      entityType: 'UploadBatch',
      entityId: result.uploadBatch.id,
      details: {
        totalRows: rows.length,
        accepted: result.studentCount,
        rejected: validationResult.rejectedRows,
        fileName,
      },
    });

    res.status(201).json({
      message: `Batch committed successfully. ${result.studentCount} student records enrolled.`,
      uploadBatch: result.uploadBatch,
      validationResult,
    });
  } catch (error) {
    console.error('Error committing upload batch:', error);
    res.status(500).json({ error: 'Failed to commit batch to database.' });
  }
}

export async function getUploadBatches(req, res) {
  try {
    const user = req.user;
    const { institutionId } = req.query;

    const where = {};
    if (user?.role === ROLES.INSTITUTION_ADMIN) {
      where.institutionId = user.institutionId;
    } else if (institutionId) {
      where.institutionId = String(institutionId);
    }

    const batches = await prisma.uploadBatch.findMany({
      where,
      include: {
        institution: {
          select: { id: true, name: true, code: true },
        },
        uploadedByUser: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { validationIssues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(batches);
  } catch (error) {
    console.error('Error fetching upload batches:', error);
    res.status(500).json({ error: 'Failed to fetch upload batches.' });
  }
}

export async function getUploadBatchById(req, res) {
  try {
    const id = String(req.params.id);
    const user = req.user;

    const batch = await prisma.uploadBatch.findUnique({
      where: { id },
      include: {
        institution: true,
        uploadedByUser: { select: { id: true, name: true, email: true } },
        validationIssues: {
          orderBy: { rowNumber: 'asc' },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({ error: 'Upload batch not found.' });
    }

    if (user?.role === ROLES.INSTITUTION_ADMIN && user.institutionId !== batch.institutionId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(batch);
  } catch (error) {
    console.error('Error fetching batch by id:', error);
    res.status(500).json({ error: 'Failed to fetch upload batch details.' });
  }
}
