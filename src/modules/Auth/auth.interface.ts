import { Model, Document } from 'mongoose';
import { Role } from '../../types/role';

export interface IAuth extends Document {
  name: string;
  email: string;
  password?: string; // Optional for social login users
  role: Role;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerified?: boolean; // For Better Auth compatibility
  image: string; // For Better Auth compatibility
  createdAt: Date;
  updatedAt: Date;
  isPasswordMatched?(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}

export interface IAuthModel extends Model<IAuth> {
  isPasswordMatched?(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  name: string;
  email: string;
  password: string;
}

export interface IRefreshToken {
  refreshToken: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}