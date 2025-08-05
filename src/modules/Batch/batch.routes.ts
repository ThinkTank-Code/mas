import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { BatchController } from './batch.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';
import { createBatchSchema, updateBatchSchema } from './batch.validation';
const router = express.Router();

router.get(
    '/',
    auth(Role.ADMIN, Role.SUPERADMIN),
    BatchController.getAllBatches
);
router.get(
    '/:id',
    auth(Role.ADMIN, Role.SUPERADMIN),
    BatchController.getBatchById
);

router.patch(
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

export const BatchRoutes = router;