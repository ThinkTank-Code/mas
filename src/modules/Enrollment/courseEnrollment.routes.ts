import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';
import { CourseEnrollmentController } from './courseEnrollment.controller';

const router = express.Router();

// All routes require learner authentication
router.use(auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN));

// Get course progress
router.get('/:courseId/progress', CourseEnrollmentController.getCourseProgress);

// Complete a lesson
router.post('/:courseId/complete-lesson', CourseEnrollmentController.completeLesson);

export const CourseEnrollmentRoutes = router;