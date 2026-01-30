import express from 'express';
import { SettingsController } from './settings.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../types/role';

const router = express.Router();

router.get('/', SettingsController.getSettings);

router.patch(
  '/',
  auth(Role.ADMIN, Role.SUPERADMIN,),
  SettingsController.updateSettings
);

export const SettingsRoutes = router;