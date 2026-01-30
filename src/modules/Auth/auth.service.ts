import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/ApiError';
import { AuthModel } from './auth.model';
import { generateToken, verifyToken } from '../../utils/jwt';
import { Types } from 'mongoose';
import { Role } from '../../types/role';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../services/emailService';
import { ProfileService } from '../Profile/profile.service';

export const AuthService = {
  async login(email: string, password: string) {
    const user = await AuthModel.findOne({ email });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid credentials');
    }

    // Check if user has a password (not a social login user)
    if (!user.password) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'This account uses social login. Please use Google to sign in.');
    }

    const isPasswordMatch = await user.isPasswordMatched!(password, user.password);

    if (!isPasswordMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    const token = generateToken({
      id: user._id as Types.ObjectId,
      role: user.role,
    });

    const refreshToken = generateToken({
      id: user._id as Types.ObjectId,
      role: user.role,
    }, '30d');

    return {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async register(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'User with this email already exists');
    }

    // Create new user
    const user = await AuthModel.create({
      name,
      email,
      password,
      role: Role.LEARNER, // Default role for new registrations
    });

    // Create a basic profile for the new user
    try {
      await ProfileService.createProfile(user._id.toString(), {
        emailNotifications: true,
        pushNotifications: true,
        courseReminders: true,
        profileVisibility: true,
      });
    } catch (profileError) {
      console.warn('Failed to create profile for new user:', profileError);
      // Don't fail registration if profile creation fails
    }

    const token = generateToken({
      id: user._id as Types.ObjectId,
      role: user.role,
    });

    const refreshToken = generateToken({
      id: user._id as Types.ObjectId,
      role: user.role,
    }, '30d');

    return {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async socialLogin(email: string, name?: string, image?: string) {
    // Find user by email
    let user = await AuthModel.findOne({ email });

    if (!user) {
      // Create new user for social login
      user = await AuthModel.create({
        name: name || email.split('@')[0], // Use provided name or email prefix as name
        email,
        password: null, // No password for social login users
        role: Role.LEARNER, // Default role for social login
        image: image || undefined, // Set image if provided
      });

      // Create a basic profile for the new social login user
      try {
        await ProfileService.createProfile(user._id.toString(), {
          emailNotifications: true,
          pushNotifications: true,
          courseReminders: true,
          profileVisibility: true,
        });
      } catch (profileError) {
        console.warn('Failed to create profile for new social login user:', profileError);
        // Don't fail social login if profile creation fails
      }
    } else {
      // Update existing user with social login data
      if (name && name !== user.name) {
        user.name = name;
      }
      if (image && image !== user.image) {
        user.image = image;
      }
      await user.save();
    }

    const token = generateToken({
      id: user._id as Types.ObjectId,
      role: user.role,
    });

    const refreshToken = generateToken({
      id: user._id as Types.ObjectId,
      role: user.role,
    }, '30d');

    // Return complete user data (like getMe does)
    const completeUser = await AuthModel.findById(user._id).select('-password');

    return {
      token,
      refreshToken,
      user: completeUser,
    };
  },

  async getMe(userId: string) {
    const user = await AuthModel.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  },

  async updateProfile(userId: string, updateData: Partial<{ name: string; email: string }>) {
    const user = await AuthModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await AuthModel.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (typeof user.isPasswordMatched !== 'function') {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Password comparison method not implemented');
    }

    if (typeof user.password !== 'string') {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password is not set for this user');
    }

    const isOldPasswordMatch = await user.isPasswordMatched(oldPassword, user.password);
    if (!isOldPasswordMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Old password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  },

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token is required');
    }

    try {
      const payload = verifyToken(refreshToken) as { id: string; role: Role };
      if (!payload?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
      }

      const user = await AuthModel.findById(payload.id);
      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
      }

      const token = generateToken({ id: user._id as Types.ObjectId, role: user.role });
      const newRefreshToken = generateToken({ id: user._id as Types.ObjectId, role: user.role }, '30d');

      return {
        token,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (err: any) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
    }
  },

  async forgetPassword(email: string) {
    const user = await AuthModel.findOne({ email });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Queue a password reset email via EmailService (idempotent and queued)
    await sendPasswordResetEmail(user.email, user.name || user.email, resetToken);

    return { message: 'Password reset email sent successfully' };
  },

  async resetPassword(token: string, newPassword: string) {
    // Hash the token to compare with stored hash
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await AuthModel.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  },

  async listUsers() {
    const users = await AuthModel.find({}, { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0 }).sort({ createdAt: -1 });
    return users;
  },

  async createUser(data: { name: string; email: string; password: string; role?: string }) {
    const { name, email, password, role = 'STUDENT' } = data;
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'User already exists with this email');
    }
    const user = await AuthModel.create({ name, email, password, role });
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  },

  async updateUser(id: string, data: { name?: string; email?: string; role?: string; isActive?: boolean }) {
    const user = await AuthModel.findById(id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    Object.assign(user, data);
    await user.save();
    return { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
  },

  async deleteUser(id: string) {
    const user = await AuthModel.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return { message: 'User deleted successfully' };
  },
};