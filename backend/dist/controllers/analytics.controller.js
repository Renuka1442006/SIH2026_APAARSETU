import prisma from '../config/prisma.js';
export async function getAicteDashboard(req, res) {
    try {
        const { state, academicYear = '2024-25', institutionId } = req.query;
        const instWhere = {};
        if (state)
            instWhere.state = String(state);
        if (institutionId)
            instWhere.id = String(institutionId);
        // 1. KPI Counts
        const [totalInstitutions, totalStudents, totalEnrolments, flaggedEnrolments, activeReviewCases, validationIssuesCount, credentialsCount,] = await Promise.all([
            prisma.institution.count({ where: instWhere }),
            prisma.student.count(),
            prisma.enrolment.count({
                where: {
                    academicYear: String(academicYear),
                    ...(institutionId ? { institutionId: String(institutionId) } : {}),
                },
            }),
            prisma.enrolment.count({
                where: {
                    academicYear: String(academicYear),
                    status: 'FLAGGED',
                    ...(institutionId ? { institutionId: String(institutionId) } : {}),
                },
            }),
            prisma.reviewCase.count({
                where: {
                    status: 'UNDER_REVIEW',
                    ...(institutionId ? { primaryInstitutionId: String(institutionId) } : {}),
                },
            }),
            prisma.validationIssue.count({
                where: { isResolved: false },
            }),
            prisma.verificationCredential.count({
                where: { status: 'ACTIVE' },
            }),
        ]);
        // 2. Intake vs Enrolment aggregated by Course across institutions
        const intakeApprovals = await prisma.intakeApproval.findMany({
            where: {
                academicYear: String(academicYear),
                ...(institutionId ? { institutionId: String(institutionId) } : {}),
            },
            include: {
                course: true,
                institution: { select: { id: true, name: true, code: true, state: true } },
            },
        });
        const enrolments = await prisma.enrolment.findMany({
            where: {
                academicYear: String(academicYear),
                ...(institutionId ? { institutionId: String(institutionId) } : {}),
            },
            include: {
                course: true,
                institution: true,
            },
        });
        // Course-wise aggregation
        const courseMap = new Map();
        for (const app of intakeApprovals) {
            const key = app.course.code;
            if (!courseMap.has(key)) {
                courseMap.set(key, {
                    courseCode: app.course.code,
                    courseName: app.course.name,
                    approvedIntake: 0,
                    actualEnrolment: 0,
                    supernumerary: 0,
                });
            }
            const entry = courseMap.get(key);
            entry.approvedIntake += app.approvedIntake;
        }
        for (const enr of enrolments) {
            const key = enr.course.code;
            if (!courseMap.has(key)) {
                courseMap.set(key, {
                    courseCode: enr.course.code,
                    courseName: enr.course.name,
                    approvedIntake: 0,
                    actualEnrolment: 0,
                    supernumerary: 0,
                });
            }
            const entry = courseMap.get(key);
            if (enr.isSupernumerary) {
                entry.supernumerary += 1;
            }
            else {
                entry.actualEnrolment += 1;
            }
        }
        const courseStats = Array.from(courseMap.values());
        // 3. Institution-wise Intake vs Actual Enrolment
        const instMap = new Map();
        for (const app of intakeApprovals) {
            const id = app.institutionId;
            if (!instMap.has(id)) {
                instMap.set(id, {
                    institutionId: id,
                    institutionName: app.institution.name,
                    code: app.institution.code,
                    state: app.institution.state,
                    approved: 0,
                    actual: 0,
                    supernumerary: 0,
                    complianceRate: 100,
                });
            }
            instMap.get(id).approved += app.approvedIntake;
        }
        for (const enr of enrolments) {
            const id = enr.institutionId;
            if (instMap.has(id)) {
                const item = instMap.get(id);
                if (enr.isSupernumerary) {
                    item.supernumerary += 1;
                }
                else {
                    item.actual += 1;
                }
            }
        }
        const institutionStats = Array.from(instMap.values()).map((inst) => ({
            ...inst,
            complianceRate: inst.approved > 0 ? Math.min(100, Math.round((inst.actual / inst.approved) * 100)) : 100,
            isExcess: inst.actual > inst.approved,
        }));
        // 4. State-wise distribution
        const stateMap = new Map();
        const institutions = await prisma.institution.findMany({
            include: {
                _count: { select: { students: true } },
            },
        });
        for (const inst of institutions) {
            if (!stateMap.has(inst.state)) {
                stateMap.set(inst.state, { state: inst.state, count: 0, studentCount: 0 });
            }
            const s = stateMap.get(inst.state);
            s.count += 1;
            s.studentCount += inst._count.students;
        }
        // 5. Recent unresolved issues & alerts
        const recentAlerts = await prisma.validationIssue.findMany({
            where: {
                severity: { in: ['ERROR', 'WARNING'] },
                isResolved: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        // 6. Category breakdown
        const categoryCounts = await prisma.student.groupBy({
            by: ['socialCategory'],
            _count: { id: true },
        });
        const supernumeraryCounts = await prisma.student.groupBy({
            by: ['supernumeraryCategory'],
            _count: { id: true },
        });
        res.json({
            summary: {
                totalInstitutions,
                totalStudents,
                totalEnrolments,
                acceptedEnrolments: totalEnrolments - flaggedEnrolments,
                flaggedEnrolments,
                activeReviewCases,
                validationIssuesCount,
                credentialsCount,
                academicYear,
            },
            courseStats,
            institutionStats,
            stateDistribution: Array.from(stateMap.values()),
            recentAlerts,
            demographics: {
                categories: categoryCounts.map((c) => ({ name: c.socialCategory, count: c._count.id })),
                supernumerary: supernumeraryCounts.map((s) => ({ name: s.supernumeraryCategory, count: s._count.id })),
            },
        });
    }
    catch (error) {
        console.error('Error getting AICTE dashboard analytics:', error);
        res.status(500).json({ error: 'Failed to retrieve dashboard analytics.' });
    }
}
export async function getInstitutionIntakeMetrics(req, res) {
    try {
        const institutionId = String(req.params.institutionId);
        const academicYear = String(req.query.academicYear || '2024-25');
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId },
            include: {
                courses: {
                    include: {
                        intakeApprovals: {
                            where: { academicYear },
                        },
                        enrolments: {
                            where: { academicYear },
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        apaarId: true,
                                        apaarStatus: true,
                                        supernumeraryCategory: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!institution) {
            res.status(404).json({ error: 'Institution not found.' });
            return;
        }
        const coursesData = institution.courses.map((course) => {
            const approval = course.intakeApprovals[0];
            const approvedIntake = approval ? approval.approvedIntake : 60;
            const maxSupernumerary = approval ? approval.maxSupernumerary : Math.round(approvedIntake * 0.15);
            const regularEnrolments = course.enrolments.filter((e) => !e.isSupernumerary);
            const supernumeraryEnrolments = course.enrolments.filter((e) => e.isSupernumerary);
            return {
                courseId: course.id,
                courseCode: course.code,
                courseName: course.name,
                approvedIntake,
                maxSupernumerary,
                regularCount: regularEnrolments.length,
                supernumeraryCount: supernumeraryEnrolments.length,
                totalEnrolment: course.enrolments.length,
                availableRegularSeats: Math.max(0, approvedIntake - regularEnrolments.length),
                isExcessRegular: regularEnrolments.length > approvedIntake,
                excessCount: Math.max(0, regularEnrolments.length - approvedIntake),
                approvalLetterRef: approval?.approvalLetterRef || 'AICTE/SANCTION/2024-25',
            };
        });
        res.json({
            institution: {
                id: institution.id,
                name: institution.name,
                code: institution.code,
                aisheCode: institution.aisheCode,
                state: institution.state,
            },
            academicYear,
            courses: coursesData,
        });
    }
    catch (error) {
        console.error('Error fetching institution intake metrics:', error);
        res.status(500).json({ error: 'Failed to retrieve intake metrics.' });
    }
}
