import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

router.get(
    '/',
    auth(Role.ADMIN, Role.SUPERADMIN),
    PaymentController.getPaymentHistory
);

router.patch(
    '/status/:tran_id',
    auth(Role.ADMIN, Role.SUPERADMIN),
    PaymentController.updatePaymentWithEnrollStatus
);


router.post("/status", PaymentController.checkPaymentStatus);

export const PaymentRoutes = router;