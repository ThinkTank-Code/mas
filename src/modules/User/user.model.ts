import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserStatus } from '../../types/common';
import { Role } from '../../types/role';
import { IUser, IUserDocument } from './user.interface';

const userSchema = new Schema<IUserDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.LEARNER,
            required: true,
        },
        image: { type: String },
        emailVerified: { type: Boolean, default: false },
        emailVerificationToken: { type: String, select: false },
        emailVerificationExpiry: { type: Date, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpiry: { type: Date, select: false },
        avatar: { type: String },
        phone: { type: String },
        address: { type: String },
        status: {
            type: String,
            enum: Object.values(UserStatus),
            default: UserStatus.Active,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual field for profilePicture (alias for avatar/image)
userSchema.virtual('profilePicture').get(function() {
    return this.avatar || this.image;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export const UserModel = model<IUserDocument>('User', userSchema);
