import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../errors/ApiError';
import { verifyToken } from '../utils/jwt';

const auth =
    (...requiredRoles: string[]) =>
        async (req: any, res: Response, next: NextFunction) => {
            return new Promise(async (resolve, reject) => {
                // Try Authorization header first
                const authHeader = req.headers.authorization;
                let tokenString: string | undefined = undefined;

                if (authHeader) {
                    tokenString = authHeader.split(' ')[1];
                    console.debug('[auth middleware] token from Authorization header:', !!tokenString);
                }

                // Fallback to cookie header (for server-side cookie based checks)
                if (!tokenString) {
                    const cookieHeader = req.headers.cookie as string | undefined;
                    if (cookieHeader) {
                        const match = cookieHeader.match(/(^|;\s*)token=([^;]+)/);
                        tokenString = match ? match[2] : undefined;
                        console.debug('[auth middleware] token from cookie header:', !!tokenString);
                    }
                }

                // Fallback to req.cookies if cookie-parser is used
                if (!tokenString && req.cookies?.token) {
                    tokenString = req.cookies.token;
                    console.debug('[auth middleware] token from req.cookies:', !!tokenString);
                }

                if (!tokenString) {
                    return reject(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
                }

                let verifiedUser;
                try {
                    verifiedUser = verifyToken(tokenString);
                } catch (error: any) {
                    // Handle expired token
                    if (error.name === 'TokenExpiredError') {
                        return reject(new ApiError(StatusCodes.UNAUTHORIZED, 'Token expired'));
                    }
                    // Handle invalid token
                    return reject(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token'));
                }

                if (!verifiedUser) {
                    return reject(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
                }

                req.user = verifiedUser;

                // @ts-ignore
                if (requiredRoles.length && !requiredRoles.includes(verifiedUser?.role)) {
                    return reject(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden'));
                }

                resolve(verifiedUser);
            })
                .then(() => next())
                .catch((err) => next(err));
        };

export default auth;