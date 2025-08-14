import express from 'express';
import { EnrolledStudentController } from './studentEnrollment.controller';

const router = express.Router();

router.get(
    '/',
    // auth(Role.ADMIN, Role.SUPERADMIN),
    EnrolledStudentController.getEnrolledStudents
);


export const EnrolledStudentRoutes = router;