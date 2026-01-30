import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IAuth, IAuthModel } from './auth.interface';
import { Role } from '../../types/role';

const authSchema = new Schema<IAuth>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for social login users
  role: { type: String, enum: Object.values(Role), default: Role.LEARNER },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  emailVerified: { type: Boolean, default: false }, // For Better Auth compatibility
  image: { type: String,default:"https://i.fbcd.co/products/resized/resized-750-500/d4c961732ba6ec52c0bbde63c9cb9e5dd6593826ee788080599f68920224e27d.jpg" }, // For Better Auth compatibility
}, { timestamps: true });

authSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

authSchema.methods.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const AuthModel = model<IAuth>('User', authSchema);