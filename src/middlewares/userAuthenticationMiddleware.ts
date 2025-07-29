import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Config } from '../config/config';

declare global{
    namespace Express {
        interface Request{
            user: any;
        }
    }
}

export function userAuthenticateJWT(request: Request, response: Response, next: NextFunction) {
    const token = request.header('Authorization');

    if (!token) {
        return response.status(401).json({ message: 'Unauthorized: Access Token Missing' });
    }

    jwt.verify(token.replace('Bearer ', ''), Config.secret, (error, user) => {
        if (error) {
            return response.status(403).json({ message: 'Forbidden: Invalid Token' });
        }

        request.user = user;
        next();
    });
}