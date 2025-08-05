import express from 'express';
import { AdminAuthRoutes } from '../modules/Admin/admin.routes';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/admin',
        route: AdminAuthRoutes,
    },

];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;