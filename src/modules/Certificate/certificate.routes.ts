import express from 'express';
import { CertificateController } from './certificate.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

// Public route - verify certificate
router.get('/verify/:certificateId', CertificateController.verifyCertificate);

// Student routes - request certificate
router.post(
    '/request/:enrollmentId',
    auth(Role.LEARNER),
    CertificateController.requestCertificate
);

// Authenticated routes - view certificates
router.get(
    '/my-certificates',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    CertificateController.getMyCertificates
);

router.get(
    '/enrollment/:enrollmentId',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    CertificateController.getCertificate
);

router.get(
    '/enrollment/:enrollmentId/eligibility',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    CertificateController.checkEligibility
);

// Admin routes - manage certificates
router.get(
    '/pending',
    auth(Role.ADMIN, Role.SUPERADMIN),
    CertificateController.getPendingCertificates
);

router.post(
    '/approve/:certificateId',
    auth(Role.ADMIN, Role.SUPERADMIN),
    CertificateController.approveCertificate
);

router.post(
    '/issue/:enrollmentId',
    auth(Role.ADMIN, Role.SUPERADMIN),
    CertificateController.issueCertificate
);

router.put(
    '/revoke/:certificateId',
    auth(Role.ADMIN, Role.SUPERADMIN),
    CertificateController.revokeCertificate
);

export const CertificateRoutes = router;
