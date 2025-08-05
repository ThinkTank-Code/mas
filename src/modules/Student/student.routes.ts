import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';
import { StudentController } from './student.controller';
const router = express.Router();

router.post(
    '/',
    StudentController.enrollStudent
);

export const StudentRoutes = router;