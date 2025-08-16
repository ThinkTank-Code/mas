import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../errors/ApiError';
import { verifyToken } from '../utils/jwt';

const auth =
    (...requiredRoles: string[]) =>
        async (req: any, res: Response, next: NextFunction) => {
            return new Promise(async (resolve, reject) => {
                const token = req.headers.authorization;

                if (!token) {
                    return reject(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
                }

                const extractToken = token.split(" ")[1];

                const verifiedUser = verifyToken(extractToken);

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