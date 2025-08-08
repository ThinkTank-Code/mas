import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';
import { StudentController } from './student.controller';
const router = express.Router();

router.get(
    '/',
    StudentController.getAllStudents
)

router.post(
    '/',
    StudentController.enrollStudent
);

router.post('/ipn', StudentController.webhook)

export const StudentRoutes = router;