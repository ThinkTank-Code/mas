import express from 'express';
import { AdminAuthRoutes } from '../modules/Admin/admin.routes';
import { BatchRoutes } from '../modules/Batch/batch.routes';


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

];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;