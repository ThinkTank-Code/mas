import express from 'express';
import { CourseController } from './course.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

// Public routes
router.get('/', CourseController.getAllCourses);
router.get('/slug/:slug', CourseController.getCourseBySlug);
router.get('/:id', CourseController.getCourseById);

// Admin and Lead Instructor routes (instructors can edit courses they teach)
router.post(
    '/',
    auth(Role.ADMIN, Role.SUPERADMIN, Role.INSTRUCTOR),
    CourseController.createCourse
);

router.put(
    '/:id',
    auth(Role.ADMIN, Role.SUPERADMIN, Role.INSTRUCTOR),
    CourseController.updateCourse
);

// Only SuperAdmins can delete courses
router.delete(
    '/:id',
    auth(Role.SUPERADMIN),
    CourseController.deleteCourse
);

export const CourseRoutes = router;
