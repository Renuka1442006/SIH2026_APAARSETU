import prisma from '../config/prisma.js';
import { APAAR_REGEX, normalizeApaar, ISSUE_TYPES } from '../utils/constants.js';
export async function validateStudentBatch(institutionId, academicYear, rows) {
    const issues = [];
    const processedRows = [];
    // 1. Fetch Institution, Courses and Intake Approvals
    const courses = await prisma.course.findMany({
        where: { institutionId },
        include: {
            intakeApprovals: {
                where: { academicYear },
            },
            enrolments: {
                where: {
                    academicYear,
                    status: { in: ['ACTIVE', 'PROMOTED', 'FLAGGED'] },
                },
            },
        },
    });
    const courseMap = new Map(courses.map((c) => [c.code.toUpperCase(), c]));
    // Track occurrences within file for duplicate checks
    const fileApaarSeen = new Map(); // apaar -> first row seen
    const fileRollSeen = new Map(); // roll -> first row seen
    // Calculate incoming course demand
    const regularIncomingPerCourse = new Map();
    const supernumeraryIncomingPerCourse = new Map();
    // 2. Fetch all existing active students with APAAR IDs in DB across ALL institutions (for cross-institution checks)
    const allActiveEnrolments = await prisma.enrolment.findMany({
        where: {
            academicYear,
            status: { in: ['ACTIVE', 'PROMOTED', 'FLAGGED'] },
        },
        include: {
            student: true,
            institution: {
                select: { id: true, code: true, name: true, state: true },
            },
            course: {
                select: { code: true, name: true },
            },
        },
    });
    // Map: normalizedApaar -> Enrolment details
    const crossInstitutionEnrolmentMap = new Map();
    for (const enr of allActiveEnrolments) {
        if (enr.student.apaarId) {
            const norm = normalizeApaar(enr.student.apaarId);
            if (norm) {
                crossInstitutionEnrolmentMap.set(norm, enr);
            }
        }
    }
    // Row by row inspection
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = row.rowNumber || i + 1;
        const studentName = (row.fullName || '').trim();
        let rowHasError = false;
        // Normalise supernumerary
        const isNri = String(row.nriCategory).toLowerCase() === 'true' || String(row.nriCategory).toLowerCase() === 'yes';
        const isOci = String(row.ociStatus).toLowerCase() === 'true' || String(row.ociStatus).toLowerCase() === 'yes';
        const isForeign = String(row.foreignNational).toLowerCase() === 'true' || String(row.foreignNational).toLowerCase() === 'yes';
        const supCategory = (row.supernumeraryCategory || 'NONE').toUpperCase();
        const isSupernumerary = supCategory !== 'NONE' || isNri || isOci || isForeign;
        // --- CHECK 1: Missing Required Fields ---
        if (!studentName) {
            issues.push({
                rowNumber,
                studentName: 'Unknown',
                apaarId: row.apaarId || 'N/A',
                issueType: ISSUE_TYPES.MISSING_FIELD,
                severity: 'ERROR',
                message: 'Student full name is required.',
            });
            rowHasError = true;
        }
        if (!row.dob || isNaN(Date.parse(row.dob))) {
            issues.push({
                rowNumber,
                studentName,
                apaarId: row.apaarId || 'N/A',
                issueType: ISSUE_TYPES.MISSING_FIELD,
                severity: 'ERROR',
                message: 'Valid Date of Birth (YYYY-MM-DD) is required.',
            });
            rowHasError = true;
        }
        else {
            const birthDate = new Date(row.dob);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 14 || age > 70) {
                issues.push({
                    rowNumber,
                    studentName,
                    apaarId: row.apaarId || 'N/A',
                    issueType: ISSUE_TYPES.CONFLICTING_DATA,
                    severity: 'WARNING',
                    message: `Unusual age detected (${age} years old) based on DOB ${row.dob}.`,
                });
            }
        }
        if (!row.rollNumber) {
            issues.push({
                rowNumber,
                studentName,
                apaarId: row.apaarId || 'N/A',
                issueType: ISSUE_TYPES.MISSING_FIELD,
                severity: 'ERROR',
                message: 'Institution roll / registration number is required.',
            });
            rowHasError = true;
        }
        // --- CHECK 2: Course Validation ---
        const courseCodeClean = (row.courseCode || '').trim().toUpperCase();
        const course = courseMap.get(courseCodeClean);
        if (!course) {
            issues.push({
                rowNumber,
                studentName,
                apaarId: row.apaarId || 'N/A',
                issueType: ISSUE_TYPES.CONFLICTING_DATA,
                severity: 'ERROR',
                message: `Course code '${row.courseCode}' does not exist or is not approved for this institution.`,
            });
            rowHasError = true;
        }
        // --- CHECK 3: APAAR Identifier Validation ---
        const rawApaar = (row.apaarId || '').trim();
        let normApaar = null;
        if (!rawApaar) {
            // Missing APAAR Identifier
            issues.push({
                rowNumber,
                studentName,
                apaarId: 'MISSING',
                issueType: ISSUE_TYPES.MISSING_APAAR,
                severity: 'WARNING',
                message: 'Missing APAAR ID. Record will require simulated verification or DigiLocker link post-admission.',
            });
        }
        else {
            // Format validation
            if (!APAAR_REGEX.test(rawApaar)) {
                issues.push({
                    rowNumber,
                    studentName,
                    apaarId: rawApaar,
                    issueType: ISSUE_TYPES.INVALID_FORMAT,
                    severity: 'ERROR',
                    message: `Invalid APAAR format: '${rawApaar}'. Must be exactly 12 digits (e.g. 1234-5678-9012 or 123456789012).`,
                });
                rowHasError = true;
            }
            else {
                normApaar = normalizeApaar(rawApaar);
                // Informative note on synthetic verification
                issues.push({
                    rowNumber,
                    studentName,
                    apaarId: normApaar || rawApaar,
                    issueType: 'SIMULATION_NOTICE',
                    severity: 'INFO',
                    message: 'Format-valid synthetic test identifier. Clearly marked as simulated verification.',
                });
                // --- CHECK 4: Duplicate Within Current File ---
                if (normApaar && fileApaarSeen.has(normApaar)) {
                    const firstRow = fileApaarSeen.get(normApaar);
                    issues.push({
                        rowNumber,
                        studentName,
                        apaarId: normApaar,
                        issueType: ISSUE_TYPES.FILE_DUPLICATE,
                        severity: 'ERROR',
                        message: `Duplicate APAAR ID within this upload batch. Previously appeared on row ${firstRow}.`,
                    });
                    rowHasError = true;
                }
                else if (normApaar) {
                    fileApaarSeen.set(normApaar, rowNumber);
                }
                // --- CHECK 5: Duplicate in Database (Same Institution) ---
                if (normApaar) {
                    const existingSameInst = await prisma.student.findFirst({
                        where: {
                            apaarId: normApaar,
                            currentInstitutionId: institutionId,
                            enrolments: {
                                some: { academicYear },
                            },
                        },
                    });
                    if (existingSameInst) {
                        issues.push({
                            rowNumber,
                            studentName,
                            apaarId: normApaar,
                            issueType: ISSUE_TYPES.DB_DUPLICATE,
                            severity: 'ERROR',
                            message: `Student with APAAR ${normApaar} already has an active enrolment in this institution for academic year ${academicYear}.`,
                        });
                        rowHasError = true;
                    }
                    // --- CHECK 6: CRITICAL CROSS-INSTITUTION DUPLICATE ENROLMENT ---
                    const crossMatch = crossInstitutionEnrolmentMap.get(normApaar);
                    if (crossMatch && crossMatch.institutionId !== institutionId) {
                        issues.push({
                            rowNumber,
                            studentName,
                            apaarId: normApaar,
                            issueType: ISSUE_TYPES.CROSS_INSTITUTION_DUPLICATE,
                            severity: 'ERROR',
                            message: `🚨 POTENTIAL CROSS-INSTITUTION COLLISION: Student APAAR ${normApaar} is currently actively enrolled at '${crossMatch.institution.name}' (${crossMatch.institution.code}) in ${crossMatch.course.name} for academic year ${academicYear}!`,
                            details: {
                                conflictingInstitutionId: crossMatch.institutionId,
                                conflictingInstitutionName: crossMatch.institution.name,
                                conflictingInstitutionCode: crossMatch.institution.code,
                                conflictingCourse: crossMatch.course.name,
                                conflictingRoll: crossMatch.rollNumber,
                            },
                        });
                        rowHasError = true;
                    }
                }
            }
        }
        // --- CHECK 7: Roll Number Duplicate Within File ---
        const rollKey = `${courseCodeClean}:${(row.rollNumber || '').trim().toUpperCase()}`;
        if (row.rollNumber && fileRollSeen.has(rollKey)) {
            issues.push({
                rowNumber,
                studentName,
                apaarId: normApaar || 'N/A',
                issueType: ISSUE_TYPES.FILE_DUPLICATE,
                severity: 'ERROR',
                message: `Roll number '${row.rollNumber}' is duplicated in row ${fileRollSeen.get(rollKey)} for this course.`,
            });
            rowHasError = true;
        }
        else if (row.rollNumber) {
            fileRollSeen.set(rollKey, rowNumber);
        }
        // Tally incoming seats if course is valid
        if (courseCodeClean && course) {
            if (isSupernumerary) {
                supernumeraryIncomingPerCourse.set(courseCodeClean, (supernumeraryIncomingPerCourse.get(courseCodeClean) || 0) + 1);
            }
            else {
                regularIncomingPerCourse.set(courseCodeClean, (regularIncomingPerCourse.get(courseCodeClean) || 0) + 1);
            }
        }
        processedRows.push({
            ...row,
            normalizedApaar: normApaar,
            isSupernumerary,
            courseId: course?.id,
            hasErrors: rowHasError,
        });
    }
    // --- CHECK 8: Intake Capacity & Supernumerary Seats Quota Monitoring ---
    const intakeAnalysis = [];
    for (const course of courses) {
        const code = course.code.toUpperCase();
        const approval = course.intakeApprovals[0]; // for this academicYear
        const sanctionedIntake = approval ? approval.approvedIntake : 60;
        const maxSupernumerary = approval ? approval.maxSupernumerary : Math.round(sanctionedIntake * 0.15);
        // Current regular and supernumerary in DB
        const currentRegular = course.enrolments.filter((e) => !e.isSupernumerary).length;
        const currentSup = course.enrolments.filter((e) => e.isSupernumerary).length;
        const newRegular = regularIncomingPerCourse.get(code) || 0;
        const newSup = supernumeraryIncomingPerCourse.get(code) || 0;
        const projectedRegular = currentRegular + newRegular;
        const projectedSup = currentSup + newSup;
        const remainingQuota = sanctionedIntake - projectedRegular;
        const isExceeded = projectedRegular > sanctionedIntake;
        intakeAnalysis.push({
            courseCode: course.code,
            courseName: course.name,
            approvedIntake: sanctionedIntake,
            currentEnrolment: currentRegular,
            newBatchRegular: newRegular,
            newBatchSupernumerary: newSup,
            projectedTotalRegular: projectedRegular,
            remainingQuota,
            isExceeded,
        });
        if (isExceeded) {
            // Intake capacity exceeded warning/error
            issues.push({
                rowNumber: 0,
                studentName: 'BATCH ALERT',
                apaarId: 'N/A',
                issueType: ISSUE_TYPES.INTAKE_EXCEEDED,
                severity: 'ERROR',
                message: `🚨 SANCTIONED INTAKE EXCEEDED for ${course.name} (${course.code}). Approved intake is ${sanctionedIntake}, currently enrolled: ${currentRegular}, new regular batch: ${newRegular} (Total: ${projectedRegular}). Exceeds approved quota by ${projectedRegular - sanctionedIntake} seats!`,
                details: {
                    courseCode: course.code,
                    approvedIntake: sanctionedIntake,
                    currentRegular,
                    newRegular,
                    projectedRegular,
                },
            });
        }
        if (projectedSup > maxSupernumerary) {
            issues.push({
                rowNumber: 0,
                studentName: 'BATCH ALERT',
                apaarId: 'N/A',
                issueType: ISSUE_TYPES.INTAKE_EXCEEDED,
                severity: 'WARNING',
                message: `Supernumerary quota threshold alert for ${course.name}. Allowed cap is ${maxSupernumerary} seats (15%), total projected supernumerary is ${projectedSup}.`,
            });
        }
    }
    const rejectedRows = processedRows.filter((r) => r.hasErrors).length;
    const acceptedRows = processedRows.length - rejectedRows;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
    return {
        totalRows: rows.length,
        acceptedRows,
        rejectedRows,
        warningRows: warningCount,
        issues,
        processedRows,
        intakeAnalysis,
    };
}
