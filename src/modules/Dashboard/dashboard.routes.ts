import express from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

router.get(
    '/',
    auth(Role.ADMIN, Role.SUPERADMIN),
    DashboardController.getDashboardMetaData
);


export const DashboardRoutes = router;