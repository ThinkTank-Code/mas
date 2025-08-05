import jwt from 'jsonwebtoken';
import env from '../config/env';
import { Role } from '../types/role';
import { ObjectId, Types } from 'mongoose';

const JWT_SECRET = env.JWT_SECRET || 'yourSecretKey';
const JWT_EXPIRES_IN = '1d'; // Or '15m' for short-lived tokens

interface TokenPayload {
    id: Types.ObjectId | string;
    role: Role;
}

export const generateToken = ({ id, role }: TokenPayload) => {
    const payload = {
        id,
        code: 'max_fa_xyz_4312$1241Xyv3XY',
        role,
        ma_sec: '5_b_gdc_YxV',
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};
