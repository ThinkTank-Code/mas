import express from 'express';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.get(
    '/',
    // auth(Role.ADMIN, Role.SUPERADMIN),
    PaymentController.getPaymentHistory
);

router.patch(
    '/status/:tran_id',
    // auth(Role.ADMIN, Role.SUPERADMIN),
    PaymentController.updatePaymentWithEnrollStatus
);

export const PaymentRoutes = router;