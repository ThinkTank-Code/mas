import { Types } from 'mongoose';
import { UserStatus } from '../../types/common';
import { Role } from '../../types/role';
import { Document } from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: Role;
    emailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    passwordResetToken?: string;
    passwordResetExpiry?: Date;
    image?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    status: UserStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
}

export interface GetUsersParams {
    search?: string;
    status?: UserStatus;
    page?: number;
    limit?: number;
}
