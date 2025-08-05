import jwt from 'jsonwebtoken';
import env from '../config/env';

const JWT_SECRET = env.JWT_SECRET || 'yourSecretKey';
const JWT_EXPIRES_IN = '1d'; // Or '15m' for short-lived tokens

export const generateToken = (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};
