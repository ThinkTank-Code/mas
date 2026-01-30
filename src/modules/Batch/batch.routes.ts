import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { BatchController } from './batch.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';
import { createBatchSchema, updateBatchSchema } from './batch.validation';
const router = express.Router();

// Public access for listing batches (used by student-facing views)
router.get('/', BatchController.getAllBatches);
router.get('/upcoming', BatchController.getUpcomingBatches);
router.get('/current-enrollment', BatchController.getCurrentEnrollmentBatch);
router.get('/:id', BatchController.getBatchById);

router.put(
    '/:id',
    auth(Role.ADMIN, Role.SUPERADMIN),
    validateRequest(updateBatchSchema),
    BatchController.updateBatch
);

router.post(
    '/',
    auth(Role.ADMIN, Role.SUPERADMIN),
    validateRequest(createBatchSchema),
    BatchController.createBatch
);

// Manual status transition
router.post(
    '/:id/transition',
    auth(Role.ADMIN, Role.SUPERADMIN),
    BatchController.transitionBatchStatus
);

// Trigger auto-transition (admin can run manually)
router.post(
    '/auto-transition/run',
    auth(Role.ADMIN, Role.SUPERADMIN),
    BatchController.runAutoTransition
);

// Delete batch
router.delete(
    '/:id',
    auth(Role.SUPERADMIN,Role.ADMIN),
    BatchController.deleteBatch
);

export const BatchRoutes = router;