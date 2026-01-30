import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserModel } from '../User/user.model';
import { UserStatus } from '../../types/common';
import { Role } from '../../types/role';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { generateToken, verifyToken } from '../../utils/jwt';
import config from '../../config/env';
import ApiError from '../../errors/ApiError';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/emailService';


/**
 * Register new user
 */
const register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        throw new ApiError(StatusCodes.CONFLICT, 'Email already registered');
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (default role is LEARNER for new registrations)
    const user = await UserModel.create({
        name,
        email,
        password,
        phone: phoneNumber,
        status: UserStatus.Active,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpiry: emailVerificationExpires,
    });

    // Send verification email via EmailService (non-blocking) with idempotency
    try {
        const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
        // Send verification via EmailService (non-blocking)
        sendVerificationEmail(email, user.name, emailVerificationToken).catch(err => {
            console.error('Failed to queue verification email (continue):', err);
        });
    } catch (emailError) {
        console.error('Failed to prepare verification email (continue):', emailError);
        // Continue with registration even if email fails
    }

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
            userId: user._id,
            email: user.email,
        },
    });
});

/**
 * Login user
 */
const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    // Check if user is suspended or deleted
    if (user.status !== UserStatus.Active) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Account is ${user.status}. Please contact support.`
        );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Please verify your email before logging in.');
    }

    // Generate JWT with user's actual role
    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    const refreshToken = generateToken(
        { id: user._id, role: user.role },
        '30d' // Refresh token valid for 30 days
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Login successful',
        data: {
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.emailVerified,
            },
        },
    });
});

/**
 * Verify email
 */
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await UserModel.findOne({
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Generate JWT token after successful verification
    const jwtToken = generateToken({
        id: user._id,
        role: user.role,
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Email verified successfully',
        data: {
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.emailVerified,
            },
        },
    });
});

/**
 * Resend verification email
 */
const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.emailVerified) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is already verified');
    }

    // Generate new token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpiry = emailVerificationExpiry;
    await user.save();

    // Send verification email using EmailService queue (idempotent via EmailLog)
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    // Queue the email (do not block request)
    sendVerificationEmail(email, user.name, emailVerificationToken);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Verification email sent successfully',
        data: null,
    });
});

/**
 * Request password reset
 */
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
        // Don't reveal if email exists
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'If the email exists, a password reset link has been sent.',
            data: null,
        });
        return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Queue password reset email via EmailService
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    try {
        await sendPasswordResetEmail(email, user.name || email, resetToken);
        console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
        console.error(`❌ Failed to send password reset email to ${email}:`, emailError);
        // Don't fail the request, but log the error
    }


    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
        data: null,
    });
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    console.log('Reset password attempt:', { token: token ? 'present' : 'missing', newPassword: newPassword ? 'present' : 'missing' });

    const user = await UserModel.findOne({
        passwordResetToken: token,
        passwordResetExpiry: { $gt: new Date() },
    });

    console.log('User found for reset:', user ? 'yes' : 'no');

    if (!user) {
        console.log('No user found with token or token expired');
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Password reset successfully',
        data: null,
    });
});

/**
 * Change password (authenticated user)
 */
const changePassword = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user as any;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(userId).select('+password');
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Password changed successfully',
        data: null,
    });
});

/**
 * Get current user profile
 */
const getProfile = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user as any;

    const user = await UserModel.findById(userId);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
    });
});

/**
 * Update user profile
 */
const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user as any;
    const { name, phone, phoneNumber, profilePicture, image, avatar, address } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (phoneNumber !== undefined) updateData.phone = phoneNumber;

    // Handle image/avatar/profilePicture - update both fields for compatibility
    if (profilePicture !== undefined) {
        updateData.avatar = profilePicture;
        updateData.image = profilePicture;
    }
    if (image !== undefined) {
        updateData.image = image;
        updateData.avatar = image;
    }
    if (avatar !== undefined) {
        updateData.avatar = avatar;
        updateData.image = avatar;
    }

    if (address !== undefined) updateData.address = address;

    const user = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
});

/**
 * Social login (Google OAuth)
 * Creates or retrieves user and returns JWT token
 */
const socialLogin = catchAsync(async (req: Request, res: Response) => {
    const { email, name, image } = req.body;

    if (!email) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required');
    }

    // Check if user already exists
    let user = await UserModel.findOne({ email });

    if (!user) {
        // Create new user for social login
        user = await UserModel.create({
            name: name || email.split('@')[0],
            email,
            image,
            password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
            status: UserStatus.Active,
            emailVerified: true, // OAuth emails are pre-verified
            role: Role.LEARNER, // Default role for new users
        });
    }

    // Check if user is suspended or deleted
    if (user.status !== UserStatus.Active) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Account is ${user.status}. Please contact support.`
        );
    }

    // Generate JWT tokens
    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    const refreshToken = generateToken(
        { id: user._id, role: user.role },
        '30d' // Refresh token valid for 30 days
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Social login successful',
        data: {
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
                isEmailVerified: user.emailVerified,
            },
        },
    });
});

/**
 * Get current user (for /auth/me endpoint)
 */
const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user as any;

    const user = await UserModel.findById(userId);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'User retrieved successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            phone: user.phone,
            isEmailVerified: user.emailVerified,
            status: user.status,
        },
    });
});

/**
 * Refresh access token using refresh token
 */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token is required');
    }

    let decoded;
    try {
        decoded = verifyToken(refreshToken);
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token expired. Please login again.');
        }
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
    }

    const userId = (decoded as any).userId || (decoded as any).id;
    if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token payload');
    }

    // Verify user still exists and is active
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.status !== UserStatus.Active) {
        throw new ApiError(StatusCodes.FORBIDDEN, `Account is ${user.status}. Please contact support.`);
    }

    // Generate new tokens
    const newAccessToken = generateToken({
        id: user._id,
        role: user.role,
    });

    const newRefreshToken = generateToken(
        { id: user._id, role: user.role },
        '30d'
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Token refreshed successfully',
        data: {
            token: newAccessToken,
            refreshToken: newRefreshToken,
        },
    });
});

export const AuthController = {
    register,
    login,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    updateProfile,
    socialLogin,
    getCurrentUser,
    refreshToken,
};
