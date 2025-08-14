import express from 'express';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

router.get(
    '/',
    // auth(Role.ADMIN, Role.SUPERADMIN),
    DashboardController.getDashboardMetaData
);


export const DashboardRoutes = router;