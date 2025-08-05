import express from 'express';
import { AdminAuthRoutes } from '../modules/Admin/admin.routes';
import { BatchRoutes } from '../modules/Batch/batch.routes';
import { StudentRoutes } from '../modules/Student/student.routes';


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

];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;