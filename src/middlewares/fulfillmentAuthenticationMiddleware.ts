import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Config } from '../config/config';
import { fulfillment_officers } from '../models/index';

declare global{
    namespace Express {
        interface Request{
            fulfillment_officer: any;
        }
    }
}

export function fulfillmentAuthenticateJWT(request: Request, response: Response, next: NextFunction) {
    const token = request.header('Authorization');

    if (!token) {
        return response.status(401).json({ message: 'Unauthorized: Access Token Missing' });
    }

    jwt.verify(token.replace('Bearer ', ''), Config.secret, (error, user) => {
        if (error) {
            return response.status(403).json({ message: 'Forbidden: Invalid Token' });
        }

        request.fulfillment_officer = user;
        next();
    });
}