import express from 'express';
import { EnrolledStudentController } from './studentEnrollment.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

router.get(
    '/',
    auth(Role.ADMIN, Role.SUPERADMIN),
    EnrolledStudentController.getEnrolledStudents
);


export const EnrolledStudentRoutes = router;