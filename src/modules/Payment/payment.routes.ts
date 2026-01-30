import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

// Public webhook endpoint (called by SSLCommerz)
router.post('/webhook', PaymentController.sslCommerzWebhook);

// Payment status check (redirect endpoint) - SSLCommerz uses POST
router.post('/status', PaymentController.checkPaymentStatus);
router.get('/status', PaymentController.checkPaymentStatus);

// Authenticated routes
router.get(
    '/me',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    PaymentController.getMyPayments
);

router.post(
    '/checkout',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    PaymentController.initiateCheckout
);

// Admin routes
router.get(
    '/history',
    auth(Role.ADMIN, Role.SUPERADMIN),
    PaymentController.getPaymentHistory
);

router.post(
    '/:transactionId/verify',
    auth(Role.ADMIN, Role.SUPERADMIN),
    PaymentController.verifyManualPayment
);

router.put(
    '/:tran_id/status',
    auth(Role.ADMIN, Role.SUPERADMIN),
    PaymentController.updatePaymentWithEnrollStatus
);

export const PaymentRoutes = router;

