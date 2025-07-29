import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Config } from "../../config/config";
import { validateRequestBody } from "../../utils/requestValidator";
import { body, validationResult } from "express-validator";
 
const prisma = new PrismaClient();

export async function registerAdmin(request: Request, response: Response) {
    validateRequestBody(['firstname', 'lastname', 'username', 'email', 'password']);

    const { firstname, lastname, username, email, password } = request.body;

    try {
        const validationRules = [
            body('firstname').notEmpty().withMessage('First name is required'),
            body('lastname').notEmpty().withMessage('Last name is required'),
            body('email').isEmail().withMessage('Invalid email address'),
            body('username').notEmpty().withMessage('Username is reqired'),
            body('password').isLength({ min:6 }).withMessage('Password must be at least 6 characters long')
        ]

        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const existingAdmin = await prisma.admin.findFirst({
            where: {
                OR: [
                { email },
                { username },
                ],
            },
        });

        if (existingAdmin) {
            return response.status(400).json({ message: 'Email/Username already exists' })
        }

        const hashedPassword = await argon2.hash(password);

        const admin = await prisma.admin.create({
            data: {
                firstname,
                lastname,
                username,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(admin, Config.secret,  { expiresIn: '24h' });

        return response.status(200).json({
            success: true,
            status: 'Successful',
            message: 'Registration Successful',
            token,
            admin
        });
    } catch (error) {
        console.error('Error registering an admin:', error);
        response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function loginAdmin(request: Request, response: Response) {
    if (!request.body || Object.keys(request.body).length === 0) {
        return response.status(400).json({
            error: 'Empty request body',
            message: 'Request body cannot be empty',
            requestFields: ['identifier', 'password'],
            example: {
                identifier: "john.doe@example.com",
                password: "yourSecurePassword123"
            }
        });
    }

    const { identifier, password } = request.body;

    if (!identifier || !password) {
        return response.status(400).json({
            error: 'Missing fields',
            message: 'Both Username/email and password are required',
            missingFields: [
                ...(!identifier ? ['identifier'] : []),
                ...(!password ? ['password'] : [])
            ]
        });
    }

    try {
        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                { email: identifier },
                { username: identifier },
                ],
            },
        });


        if (!admin) {
            return response.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid credentials'
            })
        }

        const passwordMatch = await argon2.verify(admin.password, password);

        if (!passwordMatch) {
            return response.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email/username or password'
            })
        }

        const token = jwt.sign({ admin }, Config.secret, { expiresIn: '24h' });

        return response.status(200).json({
            success: true,
            status: 'Successful',
            message: 'Login Successful',
            token,
            admin
        });
         
    } catch (error) {
        console.error('Login error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occured during login'
        })
        
    }
}

export async function logoutAdmin(request: Request, response: Response) {
    try {
       response.clearCookie('jwt');
       response.status(200).json({ message: 'Logout successful' }) 
    } catch (error) {
        console.error('Error during logout:', error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}