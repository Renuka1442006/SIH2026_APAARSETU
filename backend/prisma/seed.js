import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  generateCredentialReference,
  signCredentialPayload,
  generateCredentialQRCode,
} from '../src/services/crypto-service.js';
import { maskApaar } from '../src/utils/constants.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting APAARSetu Database Seeding...');

  // Clean existing data in reverse order of foreign keys
  await prisma.auditEvent.deleteMany();
  await prisma.verificationCredential.deleteMany();
  await prisma.reviewCase.deleteMany();
  await prisma.validationIssue.deleteMany();
  await prisma.uploadBatch.deleteMany();
  await prisma.enrolment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.intakeApproval.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // 1. Create Institutions
  console.log('🏛️ Creating Institutions...');
  const iitd = await prisma.institution.create({
    data: {
      code: '1-001',
      name: 'Indian Institute of Technology Delhi',
      aisheCode: 'U-0109',
      state: 'Delhi',
      city: 'New Delhi',
      address: 'Hauz Khas, New Delhi 110016',
      contactEmail: 'director@iitd.ac.in',
      contactPhone: '+91-11-2659-7135',
      type: 'Institute of National Importance',
    },
  });

  const coep = await prisma.institution.create({
    data: {
      code: '1-002',
      name: 'COEP Technological University',
      aisheCode: 'U-0312',
      state: 'Maharashtra',
      city: 'Pune',
      address: 'Wellesley Road, Shivajinagar, Pune 411005',
      contactEmail: 'registrar@coep.ac.in',
      contactPhone: '+91-20-2550-7000',
      type: 'State Unitary Technical University',
    },
  });

  const vjti = await prisma.institution.create({
    data: {
      code: '1-003',
      name: 'Veermata Jijabai Technological Institute',
      aisheCode: 'U-0315',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: 'H.R. Mahajani Marg, Matunga, Mumbai 400019',
      contactEmail: 'principal@vjti.ac.in',
      contactPhone: '+91-22-2419-8101',
      type: 'State Government Autonomous Institute',
    },
  });

  const anna = await prisma.institution.create({
    data: {
      code: '1-004',
      name: 'College of Engineering Guindy, Anna University',
      aisheCode: 'U-0455',
      state: 'Tamil Nadu',
      city: 'Chennai',
      address: 'Sardar Patel Road, Guindy, Chennai 600025',
      contactEmail: 'ceg@annauniv.edu',
      contactPhone: '+91-44-2235-8000',
      type: 'State Technical University',
    },
  });

  // 2. Create Demo Users
  console.log('👥 Creating Demo Users...');
  const aictePass = await bcrypt.hash('Admin@123', 10);
  const iitdPass = await bcrypt.hash('IITD@123', 10);
  const coepPass = await bcrypt.hash('COEP@123', 10);
  const vjtiPass = await bcrypt.hash('VJTI@123', 10);
  const verifierPass = await bcrypt.hash('Verifier@123', 10);

  const aicteAdmin = await prisma.user.create({
    data: {
      email: 'aicte.admin@aicte.gov.in',
      passwordHash: aictePass,
      name: 'Dr. Ramesh Chandra (AICTE Admin)',
      role: 'AICTE_ADMIN',
      designation: 'Director, Bureau of Academic & Intake Regulation',
    },
  });

  const iitdAdmin = await prisma.user.create({
    data: {
      email: 'admin@iitd.ac.in',
      passwordHash: iitdPass,
      name: 'Prof. Rajesh K. Varma',
      role: 'INSTITUTION_ADMIN',
      institutionId: iitd.id,
      designation: 'Dean of Academic Admissions',
    },
  });

  const coepAdmin = await prisma.user.create({
    data: {
      email: 'admin@coep.ac.in',
      passwordHash: coepPass,
      name: 'Prof. Sunita Deshpande',
      role: 'INSTITUTION_ADMIN',
      institutionId: coep.id,
      designation: 'Academic Registrar & Nodal Officer',
    },
  });

  const vjtiAdmin = await prisma.user.create({
    data: {
      email: 'admin@vjti.ac.in',
      passwordHash: vjtiPass,
      name: 'Dr. Anand Kulkarni',
      role: 'INSTITUTION_ADMIN',
      institutionId: vjti.id,
      designation: 'Head of Admissions & Student Records',
    },
  });

  await prisma.user.create({
    data: {
      email: 'verifier@tcs.com',
      passwordHash: verifierPass,
      name: 'Vikram Sengupta (Corporate HR Verifier)',
      role: 'VERIFIER',
      designation: 'Senior Talent Verification Lead, TCS India',
    },
  });

  // 3. Create Courses
  console.log('📚 Creating Courses...');
  // IIT Delhi Courses
  const iitdCse = await prisma.course.create({
    data: {
      code: 'BT-CSE',
      name: 'B.Tech in Computer Science & Engineering',
      level: 'UG',
      durationYears: 4,
      institutionId: iitd.id,
    },
  });
  const iitdEce = await prisma.course.create({
    data: {
      code: 'BT-ECE',
      name: 'B.Tech in Electronics & Communication',
      level: 'UG',
      durationYears: 4,
      institutionId: iitd.id,
    },
  });
  const iitdAi = await prisma.course.create({
    data: {
      code: 'MT-AI',
      name: 'M.Tech in Artificial Intelligence',
      level: 'PG',
      durationYears: 2,
      institutionId: iitd.id,
    },
  });

  // COEP Courses
  const coepCse = await prisma.course.create({
    data: {
      code: 'BT-CSE',
      name: 'B.Tech in Computer Engineering',
      level: 'UG',
      durationYears: 4,
      institutionId: coep.id,
    },
  });
  const coepMech = await prisma.course.create({
    data: {
      code: 'BT-MECH',
      name: 'B.Tech in Mechanical Engineering',
      level: 'UG',
      durationYears: 4,
      institutionId: coep.id,
    },
  });

  // VJTI Courses
  const vjtiCse = await prisma.course.create({
    data: {
      code: 'BT-CSE',
      name: 'B.Tech in Computer Engineering',
      level: 'UG',
      durationYears: 4,
      institutionId: vjti.id,
    },
  });
  const vjtiIt = await prisma.course.create({
    data: {
      code: 'BT-IT',
      name: 'B.Tech in Information Technology',
      level: 'UG',
      durationYears: 4,
      institutionId: vjti.id,
    },
  });

  // Anna University Course
  const annaCse = await prisma.course.create({
    data: {
      code: 'BT-CSE',
      name: 'B.E. in Computer Science and Engineering',
      level: 'UG',
      durationYears: 4,
      institutionId: anna.id,
    },
  });

  // 4. Approved Intakes for 2024-25
  console.log('📋 Setting Approved Intake Sanctions...');
  await prisma.intakeApproval.createMany({
    data: [
      {
        institutionId: iitd.id,
        courseId: iitdCse.id,
        academicYear: '2024-25',
        approvedIntake: 60,
        maxSupernumerary: 9,
        approvalLetterRef: 'AICTE/NRO/2024-25/IITD-CSE-60',
      },
      {
        institutionId: iitd.id,
        courseId: iitdEce.id,
        academicYear: '2024-25',
        approvedIntake: 60,
        maxSupernumerary: 9,
        approvalLetterRef: 'AICTE/NRO/2024-25/IITD-ECE-60',
      },
      {
        institutionId: iitd.id,
        courseId: iitdAi.id,
        academicYear: '2024-25',
        approvedIntake: 30,
        maxSupernumerary: 4,
        approvalLetterRef: 'AICTE/NRO/2024-25/IITD-MTAI-30',
      },
      {
        institutionId: coep.id,
        courseId: coepCse.id,
        academicYear: '2024-25',
        approvedIntake: 120,
        maxSupernumerary: 18,
        approvalLetterRef: 'AICTE/WRO/2024-25/COEP-CSE-120',
      },
      {
        institutionId: coep.id,
        courseId: coepMech.id,
        academicYear: '2024-25',
        approvedIntake: 120,
        maxSupernumerary: 18,
        approvalLetterRef: 'AICTE/WRO/2024-25/COEP-MECH-120',
      },
      {
        institutionId: vjti.id,
        courseId: vjtiCse.id,
        academicYear: '2024-25',
        approvedIntake: 60,
        maxSupernumerary: 9,
        approvalLetterRef: 'AICTE/WRO/2024-25/VJTI-CSE-60',
      },
      {
        institutionId: vjti.id,
        courseId: vjtiIt.id,
        academicYear: '2024-25',
        approvedIntake: 60,
        maxSupernumerary: 9,
        approvalLetterRef: 'AICTE/WRO/2024-25/VJTI-IT-60',
      },
      {
        institutionId: anna.id,
        courseId: annaCse.id,
        academicYear: '2024-25',
        approvedIntake: 120,
        maxSupernumerary: 18,
        approvalLetterRef: 'AICTE/SRO/2024-25/ANNA-CSE-120',
      },
    ],
  });

  // 5. Create Students with deliberate test cases
  console.log('🎓 Creating Synthetic Students with Test Cases...');

  // Student 1: Aarav Sharma (Legitimate, Verified, will have active credential)
  const student1 = await prisma.student.create({
    data: {
      fullName: 'Aarav Sharma',
      gender: 'MALE',
      dob: new Date('2004-05-14'),
      email: 'aarav.sharma@example.in',
      phone: '+91-9876543210',
      apaarId: '2026-9811-3001',
      apaarStatus: 'SIMULATED_VERIFIED',
      socialCategory: 'GENERAL',
      currentInstitutionId: iitd.id,
      aadhaarVaultRef: 'AV-XXXX-XXXX-8921',
    },
  });

  await prisma.enrolment.create({
    data: {
      studentId: student1.id,
      institutionId: iitd.id,
      courseId: iitdCse.id,
      academicYear: '2024-25',
      rollNumber: '2024CS10101',
      status: 'ACTIVE',
      semester: 1,
      isSupernumerary: false,
    },
  });

  // Student 2: Diya Patel (TFW Supernumerary Seat)
  const student2 = await prisma.student.create({
    data: {
      fullName: 'Diya Patel',
      gender: 'FEMALE',
      dob: new Date('2005-02-28'),
      email: 'diya.patel@example.in',
      phone: '+91-9823456781',
      apaarId: '2026-9811-3002',
      apaarStatus: 'SIMULATED_VERIFIED',
      socialCategory: 'OBC',
      supernumeraryCategory: 'TFW',
      currentInstitutionId: iitd.id,
      aadhaarVaultRef: 'AV-XXXX-XXXX-4512',
    },
  });

  await prisma.enrolment.create({
    data: {
      studentId: student2.id,
      institutionId: iitd.id,
      courseId: iitdCse.id,
      academicYear: '2024-25',
      rollNumber: '2024CS10102-TFW',
      status: 'ACTIVE',
      semester: 1,
      isSupernumerary: true,
      supernumeraryQuotaType: 'TFW',
    },
  });

  // Student 3: Tenzin Dorjee (PMSSS Supernumerary Scheme)
  const student3 = await prisma.student.create({
    data: {
      fullName: 'Tenzin Dorjee',
      gender: 'MALE',
      dob: new Date('2003-11-19'),
      email: 'tenzin.d@example.in',
      phone: '+91-9811223344',
      apaarId: '2026-9811-3003',
      apaarStatus: 'SIMULATED_VERIFIED',
      socialCategory: 'ST',
      supernumeraryCategory: 'PMSSS',
      currentInstitutionId: iitd.id,
      aadhaarVaultRef: 'AV-XXXX-XXXX-7721',
    },
  });

  await prisma.enrolment.create({
    data: {
      studentId: student3.id,
      institutionId: iitd.id,
      courseId: iitdEce.id,
      academicYear: '2024-25',
      rollNumber: '2024EC10201-PMSSS',
      status: 'ACTIVE',
      semester: 1,
      isSupernumerary: true,
      supernumeraryQuotaType: 'PMSSS',
    },
  });

  // TEST CASE 1: Cross-Institution Collision!
  // Student "Rohan Aditya Sharma" with same APAAR ID enrolled at IIT Delhi and VJTI Mumbai
  const rohanApaar = '2026-9090-1122';
  const rohanIITD = await prisma.student.create({
    data: {
      fullName: 'Rohan Aditya Sharma',
      gender: 'MALE',
      dob: new Date('2004-08-12'),
      email: 'rohan.sharma@example.in',
      phone: '+91-9988776655',
      apaarId: rohanApaar,
      apaarStatus: 'FORMAT_VALID_TEST',
      socialCategory: 'GENERAL',
      currentInstitutionId: iitd.id,
      aadhaarVaultRef: 'AV-XXXX-XXXX-9911',
    },
  });

  await prisma.enrolment.create({
    data: {
      studentId: rohanIITD.id,
      institutionId: iitd.id,
      courseId: iitdCse.id,
      academicYear: '2024-25',
      rollNumber: '2024CS10103',
      status: 'FLAGGED',
      semester: 1,
      isSupernumerary: false,
    },
  });

  // Enrolment at VJTI for Rohan under another student entity with same APAAR
  const rohanVJTI = await prisma.student.create({
    data: {
      fullName: 'Rohan A. Sharma',
      gender: 'MALE',
      dob: new Date('2004-08-12'),
      email: 'rohan.vjti@example.in',
      phone: '+91-9988776655',
      apaarId: rohanApaar,
      apaarStatus: 'FORMAT_VALID_TEST',
      socialCategory: 'GENERAL',
      currentInstitutionId: vjti.id,
      aadhaarVaultRef: 'AV-XXXX-XXXX-9911',
    },
  });

  await prisma.enrolment.create({
    data: {
      studentId: rohanVJTI.id,
      institutionId: vjti.id,
      courseId: vjtiCse.id,
      academicYear: '2024-25',
      rollNumber: '241070001',
      status: 'FLAGGED',
      semester: 1,
      isSupernumerary: false,
    },
  });

  // Seed Review Case for this cross-institution collision
  await prisma.reviewCase.create({
    data: {
      caseNumber: 'RC-2026-0001',
      studentId: rohanIITD.id,
      primaryInstitutionId: iitd.id,
      conflictingInstitutionId: vjti.id,
      reason: `🚨 Cross-Institution Duplicate Enrolment: APAAR ${rohanApaar} is concurrently enrolled at IIT Delhi (BT-CSE, Roll 2024CS10103) and VJTI Mumbai (BT-CSE, Roll 241070001) for Academic Year 2024-25.`,
      status: 'UNDER_REVIEW',
    },
  });

  await prisma.validationIssue.create({
    data: {
      studentId: rohanIITD.id,
      apaarId: rohanApaar,
      studentName: 'Rohan Aditya Sharma',
      issueType: 'CROSS_INSTITUTION_DUPLICATE',
      severity: 'ERROR',
      message: 'Active concurrent enrolment detected at VJTI Mumbai (1-003).',
    },
  });

  // TEST CASE 2: Missing APAAR Identifier
  const studentMissingApaar = await prisma.student.create({
    data: {
      fullName: 'Simran Preet Kaur',
      gender: 'FEMALE',
      dob: new Date('2005-06-20'),
      email: 'simran.kaur@example.in',
      phone: '+91-9765432109',
      apaarId: null,
      apaarStatus: 'MISSING',
      socialCategory: 'GENERAL',
      currentInstitutionId: coep.id,
      aadhaarVaultRef: 'AV-XXXX-XXXX-3341',
    },
  });

  await prisma.enrolment.create({
    data: {
      studentId: studentMissingApaar.id,
      institutionId: coep.id,
      courseId: coepCse.id,
      academicYear: '2024-25',
      rollNumber: '112403001',
      status: 'ACTIVE',
      semester: 1,
      isSupernumerary: false,
    },
  });

  await prisma.validationIssue.create({
    data: {
      studentId: studentMissingApaar.id,
      apaarId: 'MISSING',
      studentName: 'Simran Preet Kaur',
      issueType: 'MISSING_APAAR',
      severity: 'WARNING',
      message: 'Student admitted without APAAR ID. Mandatory DigiLocker e-KYC sync pending.',
    },
  });

  // TEST CASE 3: Foreign National Supernumerary Enrolment
  const studentForeign = await prisma.student.create({
    data: {
      fullName: 'Fatima Al-Mansoor',
      gender: 'FEMALE',
      dob: new Date('2003-09-15'),
      email: 'fatima.almansoor@example.com',
      phone: '+971-50-1234567',
      apaarId: '2026-9811-3004',
      apaarStatus: 'SIMULATED_VERIFIED',
      socialCategory: 'GENERAL',
      foreignNational: true,
      supernumeraryCategory: 'FOREIGN_NATIONAL',
      currentInstitutionId: coep.id,
      aadhaarVaultRef: 'PASSPORT-UAE-7811',
    },
  });

  await prisma.enrolment.create({
    data: {
      studentId: studentForeign.id,
      institutionId: coep.id,
      courseId: coepCse.id,
      academicYear: '2024-25',
      rollNumber: '112403002-FN',
      status: 'ACTIVE',
      semester: 1,
      isSupernumerary: true,
      supernumeraryQuotaType: 'FOREIGN_NATIONAL',
    },
  });

  // More realistic students for COEP and VJTI to populate intake figures
  const sampleNames = [
    { name: 'Kunal Deshmukh', gender: 'MALE', cat: 'GENERAL' },
    { name: 'Pooja Kulkarni', gender: 'FEMALE', cat: 'OBC' },
    { name: 'Aniket Shinde', gender: 'MALE', cat: 'SC' },
    { name: 'Neha Joshi', gender: 'FEMALE', cat: 'EWS' },
    { name: 'Sameer Khan', gender: 'MALE', cat: 'OBC' },
    { name: 'Aditi Rao', gender: 'FEMALE', cat: 'GENERAL' },
    { name: 'Pranav Kadam', gender: 'MALE', cat: 'GENERAL' },
    { name: 'Tanvi Bhosale', gender: 'FEMALE', cat: 'OBC' },
  ];

  let idCounter = 3010;
  for (const s of sampleNames) {
    idCounter++;
    const apaar = `2026-9811-${idCounter}`;
    const st = await prisma.student.create({
      data: {
        fullName: s.name,
        gender: s.gender,
        dob: new Date('2004-03-10'),
        email: `${s.name.toLowerCase().replace(' ', '.')}@example.in`,
        phone: `+91-98${idCounter}0011`,
        apaarId: apaar,
        apaarStatus: 'SIMULATED_VERIFIED',
        socialCategory: s.cat,
        currentInstitutionId: coep.id,
        aadhaarVaultRef: `AV-XXXX-XXXX-${idCounter}`,
      },
    });

    await prisma.enrolment.create({
      data: {
        studentId: st.id,
        institutionId: coep.id,
        courseId: coepCse.id,
        academicYear: '2024-25',
        rollNumber: `1124030${idCounter - 3000}`,
        status: 'ACTIVE',
        semester: 1,
      },
    });
  }

  // TEST CASE 4: Digitally Signed Verifiable Credential for Aarav Sharma
  console.log('🔐 Generating Digitally Signed Academic Credentials...');
  const credentialRef1 = 'APAAR-CRD-2026-IITD-001';
  const issueDate1 = new Date().toISOString();
  const payload1 = {
    credentialReference: credentialRef1,
    studentId: student1.id,
    studentName: student1.fullName,
    apaarMasked: maskApaar(student1.apaarId),
    institutionCode: iitd.code,
    courseCode: iitdCse.code,
    academicYear: '2024-25',
    issuedAt: issueDate1,
  };

  const sig1 = signCredentialPayload(payload1);
  const qr1 = await generateCredentialQRCode(credentialRef1, sig1);

  await prisma.verificationCredential.create({
    data: {
      credentialReference: credentialRef1,
      studentId: student1.id,
      institutionId: iitd.id,
      courseId: iitdCse.id,
      academicYear: '2024-25',
      issuedAt: new Date(issueDate1),
      status: 'ACTIVE',
      digitalSignature: sig1,
      signatureAlgorithm: 'HMAC-SHA256',
      qrCodeDataUrl: qr1,
      verificationCount: 3,
      lastVerifiedAt: new Date(),
    },
  });

  // TEST CASE 5: Revoked Credential
  const credentialRefRevoked = 'APAAR-CRD-2026-VJTI-999';
  const issueDateRev = new Date('2024-08-01').toISOString();
  const payloadRev = {
    credentialReference: credentialRefRevoked,
    studentId: rohanVJTI.id,
    studentName: rohanVJTI.fullName,
    apaarMasked: maskApaar(rohanVJTI.apaarId),
    institutionCode: vjti.code,
    courseCode: vjtiCse.code,
    academicYear: '2024-25',
    issuedAt: issueDateRev,
  };
  const sigRev = signCredentialPayload(payloadRev);
  const qrRev = await generateCredentialQRCode(credentialRefRevoked, sigRev);

  await prisma.verificationCredential.create({
    data: {
      credentialReference: credentialRefRevoked,
      studentId: rohanVJTI.id,
      institutionId: vjti.id,
      courseId: vjtiCse.id,
      academicYear: '2024-25',
      issuedAt: new Date(issueDateRev),
      status: 'REVOKED',
      revocationReason: 'Enrolment suspended pending resolution of cross-institution collision (RC-2026-0001).',
      revokedAt: new Date(),
      digitalSignature: sigRev,
      signatureAlgorithm: 'HMAC-SHA256',
      qrCodeDataUrl: qrRev,
    },
  });

  // 6. Create Initial Audit Events
  console.log('📜 Seeding Audit Trail...');
  await prisma.auditEvent.createMany({
    data: [
      {
        userId: aicteAdmin.id,
        institutionId: null,
        action: 'SYSTEM_BOOTSTRAP',
        entityType: 'System',
        entityId: 'ROOT',
        details: JSON.stringify({ message: 'APAARSetu AICTE National Platform Initialized.' }),
      },
      {
        userId: iitdAdmin.id,
        institutionId: iitd.id,
        action: 'CREDENTIAL_ISSUED',
        entityType: 'VerificationCredential',
        entityId: credentialRef1,
        details: JSON.stringify({ student: 'Aarav Sharma', course: 'BT-CSE' }),
      },
      {
        userId: aicteAdmin.id,
        institutionId: iitd.id,
        action: 'CROSS_INSTITUTION_FLAG',
        entityType: 'ReviewCase',
        entityId: 'RC-2026-0001',
        details: JSON.stringify({ reason: 'APAAR 2026-9090-1122 collision detected across IITD and VJTI.' }),
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
