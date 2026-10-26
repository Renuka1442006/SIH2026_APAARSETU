import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ROLES, normalizeApaar, APAAR_REGEX } from '../utils/constants.js';
import { logAuditEvent } from '../services/audit-service.js';

export async function getStudents(req, res) {
  try {
    const user = req.user;
    const {
      institutionId,
      courseId,
      academicYear,
      status,
      search,
      supernumerary,
      apaarStatus,
      page = '1',
      limit = '50',
    } = req.query;

    const where = {};

    // RBAC: Institution Admin can only access their own students
    if (user?.role === ROLES.INSTITUTION_ADMIN) {
      where.currentInstitutionId = user.institutionId;
    } else if (institutionId) {
      where.currentInstitutionId = String(institutionId);
    }

    if (apaarStatus) {
      where.apaarStatus = String(apaarStatus);
    }

    if (supernumerary === 'true') {
      where.supernumeraryCategory = { not: 'NONE' };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { fullName: { contains: q } },
        { apaarId: { contains: q } },
        { email: { contains: q } },
        { enrolments: { some: { rollNumber: { contains: q } } } },
      ];
    }

    const enrolmentFilter = {};
    if (courseId) enrolmentFilter.courseId = String(courseId);
    if (academicYear) enrolmentFilter.academicYear = String(academicYear);
    if (status) enrolmentFilter.status = String(status);

    if (Object.keys(enrolmentFilter).length > 0) {
      where.enrolments = { some: enrolmentFilter };
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const take = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * take;

    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          currentInstitution: {
            select: { id: true, code: true, name: true, state: true },
          },
          enrolments: {
            include: {
              course: { select: { id: true, code: true, name: true } },
              institution: { select: { id: true, code: true, name: true } },
            },
            orderBy: { academicYear: 'desc' },
          },
          credentials: {
            select: {
              id: true,
              credentialReference: true,
              status: true,
              issuedAt: true,
            },
          },
          validationIssues: {
            where: { isResolved: false },
          },
          reviewCases: {
            select: {
              id: true,
              caseNumber: true,
              status: true,
              reason: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      students,
      pagination: {
        page: pageNum,
        limit: take,
        total: totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch student records.' });
  }
}

export async function getStudentById(req, res) {
  try {
    const id = String(req.params.id);
    const user = req.user;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        currentInstitution: true,
        enrolments: {
          include: {
            course: true,
            institution: true,
          },
          orderBy: { academicYear: 'desc' },
        },
        credentials: {
          include: {
            course: true,
          },
          orderBy: { issuedAt: 'desc' },
        },
        validationIssues: {
          orderBy: { createdAt: 'desc' },
        },
        reviewCases: {
          include: {
            primaryInstitution: true,
            conflictingInstitution: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    if (user?.role === ROLES.INSTITUTION_ADMIN && user.institutionId !== student.currentInstitutionId) {
      return res.status(403).json({ error: 'Access denied. Student belongs to another institution.' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student by id:', error);
    res.status(500).json({ error: 'Failed to fetch student details.' });
  }
}

const createStudentSchema = z.object({
  fullName: z.string().min(2),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dob: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  apaarId: z.string().optional(),
  courseId: z.string().min(1, 'Course / Branch is required'),
  institutionId: z.string().min(1, 'Institution is required'),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/).default('2024-25'),
  rollNumber: z.string().min(1),
  socialCategory: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS']).default('GENERAL'),
  nriCategory: z.boolean().default(false),
  ociStatus: z.boolean().default(false),
  foreignNational: z.boolean().default(false),
  supernumeraryCategory: z.string().default('NONE'),
});

export async function createStudent(req, res) {
  try {
    const user = req.user;

    // Bulletproof Auto-Resolve institutionId to an existing database record
    let inst = null;
    let rawInstId = req.body.institutionId;

    // For Institution Admins, always bind strictly to their own assigned institution
    if (user?.role === ROLES.INSTITUTION_ADMIN && user.institutionId) {
      inst = await prisma.institution.findUnique({
        where: { id: user.institutionId },
      });
    } else if (rawInstId && String(rawInstId).trim() !== '') {
      inst = await prisma.institution.findFirst({
        where: {
          OR: [
            { id: String(rawInstId) },
            { code: String(rawInstId) },
            { aisheCode: String(rawInstId) },
          ],
        },
      });
    }

    if (!inst && user?.institutionId) {
      inst = await prisma.institution.findUnique({
        where: { id: user.institutionId },
      });
    }

    if (!inst) {
      inst = await prisma.institution.findFirst({ orderBy: { code: 'asc' } });
    }

    if (!inst) {
      return res.status(400).json({ error: 'No active institution found in database.' });
    }

    const institutionId = inst.id;
    req.body.institutionId = institutionId;

    // Bulletproof Auto-Resolve courseId to an existing database record
    let course = null;
    let rawCourseId = req.body.courseId;
    if (rawCourseId && String(rawCourseId).trim() !== '') {
      course = await prisma.course.findFirst({
        where: {
          institutionId,
          OR: [
            { id: String(rawCourseId) },
            { code: String(rawCourseId) },
          ],
        },
      });

      if (!course) {
        course = await prisma.course.findFirst({
          where: {
            OR: [
              { id: String(rawCourseId) },
              { code: String(rawCourseId) },
            ],
          },
        });
      }
    }

    if (!course) {
      course = await prisma.course.findFirst({
        where: { institutionId },
        orderBy: { code: 'asc' },
      });
    }

    if (!course) {
      course = await prisma.course.findFirst({ orderBy: { code: 'asc' } });
    }

    if (!course) {
      return res.status(400).json({ error: 'No approved courses found in database.' });
    }

    const courseId = course.id;
    req.body.courseId = courseId;
    if (!req.body.academicYear) req.body.academicYear = '2024-25';

    const parse = createStudentSchema.safeParse(req.body);
    if (!parse.success) {
      const issues = parse.error.issues.map((i) => `${i.path.join('.') || 'field'}: ${i.message}`).join(', ');
      return res.status(400).json({ error: `Validation failed: ${issues}`, details: parse.error.format() });
    }

    const data = parse.data;

    // RBAC check
    if (user?.role === ROLES.INSTITUTION_ADMIN && user.institutionId !== data.institutionId) {
      return res.status(403).json({ error: 'You can only add students to your own institution.' });
    }

    const normApaar = data.apaarId ? normalizeApaar(data.apaarId) : null;

    // Check APAAR format
    let apaarStatus = 'MISSING';
    if (normApaar) {
      if (!APAAR_REGEX.test(normApaar)) {
        return res.status(400).json({ error: 'APAAR ID must be 12 digits.' });
      }
      apaarStatus = 'FORMAT_VALID_TEST';
    }

    // Check cross-institution duplication if APAAR provided
    let hasConflict = false;
    let conflictEnrolment = null;
    if (normApaar) {
      conflictEnrolment = await prisma.enrolment.findFirst({
        where: {
          academicYear: data.academicYear,
          status: { in: ['ACTIVE', 'PROMOTED', 'FLAGGED'] },
          student: { apaarId: normApaar },
        },
        include: { institution: true, course: true },
      });

      if (conflictEnrolment && conflictEnrolment.institutionId !== data.institutionId) {
        hasConflict = true;
      }
    }

    // Use Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          fullName: data.fullName,
          gender: data.gender,
          dob: new Date(data.dob),
          email: data.email || null,
          phone: data.phone || null,
          apaarId: normApaar,
          apaarStatus: hasConflict ? 'UNVERIFIED' : apaarStatus,
          socialCategory: data.socialCategory,
          nriCategory: data.nriCategory,
          ociStatus: data.ociStatus,
          foreignNational: data.foreignNational,
          supernumeraryCategory: data.supernumeraryCategory,
          currentInstitutionId: data.institutionId,
          aadhaarVaultRef: `AV-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });

      const isSupernumerary =
        data.supernumeraryCategory !== 'NONE' ||
        data.nriCategory ||
        data.ociStatus ||
        data.foreignNational;

      const enrolment = await tx.enrolment.create({
        data: {
          studentId: student.id,
          institutionId: data.institutionId,
          courseId: data.courseId,
          academicYear: data.academicYear,
          rollNumber: data.rollNumber,
          status: hasConflict ? 'FLAGGED' : 'ACTIVE',
          isSupernumerary,
          supernumeraryQuotaType: isSupernumerary ? data.supernumeraryCategory : null,
        },
      });

      // If cross-institution conflict, create ReviewCase immediately!
      if (hasConflict && conflictEnrolment) {
        const caseCount = await tx.reviewCase.count();
        const caseNumber = `RC-2026-${String(caseCount + 1).padStart(4, '0')}`;

        await tx.reviewCase.create({
          data: {
            caseNumber,
            studentId: student.id,
            primaryInstitutionId: data.institutionId,
            conflictingInstitutionId: conflictEnrolment.institutionId,
            reason: `Cross-institution duplicate enrolment detected. APAAR ID ${normApaar} is also active at ${conflictEnrolment.institution.name} (${conflictEnrolment.course.name}).`,
            status: 'UNDER_REVIEW',
          },
        });

        await tx.validationIssue.create({
          data: {
            studentId: student.id,
            apaarId: normApaar,
            studentName: student.fullName,
            issueType: 'CROSS_INSTITUTION_DUPLICATE',
            severity: 'ERROR',
            message: `Cross-institution duplicate enrolment detected at ${conflictEnrolment.institution.name}.`,
          },
        });
      }

      return { student, enrolment, hasConflict };
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    await logAuditEvent({
      userId: user?.userId,
      institutionId: data.institutionId,
      action: 'STUDENT_CREATE',
      entityType: 'Student',
      entityId: result.student.id,
      details: {
        name: data.fullName,
        apaar: normApaar,
        hasConflict: result.hasConflict,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student record.' });
  }
}

export async function updateEnrolmentStatus(req, res) {
  try {
    const studentId = String(req.params.studentId);
    const enrolmentId = String(req.params.enrolmentId);
    const { status, transferNotes } = req.body;

    const allowed = ['ACTIVE', 'PROMOTED', 'TRANSFERRED', 'DROPPED', 'GRADUATED', 'FLAGGED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const updated = await prisma.enrolment.update({
      where: { id: enrolmentId },
      data: {
        status,
        transferNotes: transferNotes || undefined,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: req.user?.userId,
      institutionId: updated.institutionId,
      action: 'ENROLMENT_STATUS_UPDATE',
      entityType: 'Enrolment',
      entityId: enrolmentId,
      details: { studentId, newStatus: status, transferNotes },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating enrolment status:', error);
    res.status(500).json({ error: 'Failed to update enrolment status.' });
  }
}
