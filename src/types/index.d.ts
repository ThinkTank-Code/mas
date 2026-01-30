import { Request } from 'express';
import { Role } from './role';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: Role;
                email: string;
            };
        }
    }
}

export {};
