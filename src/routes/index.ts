import express from 'express';
import { AdminAuthRoutes } from '../modules/Admin/admin.routes';
import { BatchRoutes } from '../modules/Batch/batch.routes';
import { StudentRoutes } from '../modules/Student/student.routes';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { EnrolledStudentRoutes } from '../modules/StudentEnrollment/studentEnrollment.routes';
import { DashboardRoutes } from '../modules/Dashboard/dashboard.routes';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/admin',
        route: AdminAuthRoutes,
    },
    {
        path: '/batch',
        route: BatchRoutes,
    },
    {
        path: '/student',
        route: StudentRoutes,
    },
    {
        path: '/payment',
        route: PaymentRoutes,
    },
    {
        path: '/enrolled-student',
        route: EnrolledStudentRoutes,
    },
    {
        path: '/dashboard',
        route: DashboardRoutes,
    },

];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;