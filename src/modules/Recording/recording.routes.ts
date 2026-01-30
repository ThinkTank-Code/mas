import express from 'express';
import { RecordingController } from './recording.controller';
import auth from '../../middlewares/auth';
import { checkBatchEnrollment } from '../../middlewares/batchAccess';
import { Role } from '../../types/role';

const router = express.Router();

// Admin routes
router.post('/', auth(Role.ADMIN, Role.SUPERADMIN), RecordingController.createRecording);

router.get('/', auth(Role.ADMIN, Role.SUPERADMIN), RecordingController.getAllRecordings);

router.get(
    '/:recordingId',
    auth(Role.ADMIN, Role.SUPERADMIN),
    RecordingController.getRecordingById
);

router.put(
    '/:recordingId',
    auth(Role.ADMIN, Role.SUPERADMIN),
    RecordingController.updateRecording
);

router.delete(
    '/:recordingId',
    auth(Role.ADMIN, Role.SUPERADMIN),
    RecordingController.deleteRecording
);

// Student routes - get all recordings for enrolled batches
router.get(
    '/student/my-recordings',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    RecordingController.getStudentRecordings
);

// Student routes - get recordings for their enrolled batch
router.get(
    '/batch/:batchId',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    checkBatchEnrollment,
    RecordingController.getBatchRecordings
);

router.post(
    '/:recordingId/view',
    auth(Role.LEARNER, Role.ADMIN, Role.SUPERADMIN),
    RecordingController.incrementViewCount
);

export const RecordingRoutes = router;
