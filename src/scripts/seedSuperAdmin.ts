import dotenv from 'dotenv';
import { AdminModel } from '../modules/Admin/admin.model';
import { Role } from '../types/role';
import env from '../config/env';

dotenv.config();

export const seedSuperAdmin = async () => {
    try {
        const existing = await AdminModel.findOne({ email: 'superadmin@misun.com' });
        if (existing) {
            console.log('Super Admin already exists');
            process.exit(0);
        }

        await AdminModel.create({
            name: 'Super Admin',
            email: env.SUPER_ADMIN_EMAIL,
            password: env.SUPER_ADMIN_PASSWORD, // will be hashed in pre-save hook
            role: Role.SUPERADMIN,
        });

        console.log('✅ Super Admin seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed Super Admin:', error);
        process.exit(1);
    }
};
