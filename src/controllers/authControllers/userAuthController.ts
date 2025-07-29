import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Config } from "../../config/config";
import { body, validationResult } from "express-validator";
import { validateUser } from "../../validators/userValidator";
import { generateOtp, storeOtp, verifyStoredOtp } from "../../utils/otpHandler";
import { sendSMS } from "../../utils/sendSMS";
 
const prisma = new PrismaClient();

export async function registerUser(request: Request, response: Response) {
    try {
        await Promise.all(validateUser.map((rule) => rule.run(request)));
        
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            firstname,
            lastname,
            email,
            phone,
            level,
            employee_id,
            government_entity,
            salary_per_month,
            password
        } = request.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                { email },
                { phone },
                { employee_id }
                ],
            },
        });

        if (existingUser) {
            return response.status(400).json({ message: 'Email/Phone Number/Employee ID already exists' })
        }

        const hashedPassword = await argon2.hash(password);

        const percent = 30/100

        const loan_unit = (percent * parseFloat(salary_per_month));

        const user = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                level,
                phone,
                employee_id,
                government_entity,
                salary_per_month,
                loan_unit,
                password: hashedPassword
            }
        });

        const token = jwt.sign(user, Config.secret,  { expiresIn: '24h' });

        return response.status(200).json({
            success: true,
            status: 'Successful',
            message: 'Registration Successful',
            token,
            user
        });
    } catch (error) {
        console.error('Error registering an user:', error);
        response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function initiateLogin(request: Request, response: Response) {
    const { identifier } = request.body;

    if (!identifier) {
        return response.status(400).json({
            error: 'Missing identifier',
            message: 'You must provide an identifier (email, phone, or employee_id)',
        });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { employee_id: identifier },
                    { phone: identifier }
                ],
            },
        });

        if (!user) {
            return response.status(404).json({
                error: 'User Not Found',
                message: 'No user found with provided identifier'
            });
        }

        if (!user.password) {
            return response.status(200).json({
                nextStep: 'set_password',
                message: 'User must set a new password',
                userId: user.id
            });
        }

        return response.status(200).json({
            nextStep: 'verify_password',
            message: 'User must verify password',
            userId: user.id
        });

    } catch (error) {
        console.error('Initiate login error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not process login initiation'
        });
    }
}

export async function setPassword(request: Request, response: Response) {
    const { userId, password, password_confirmation } = request.body;

    if (!userId || !password || !password_confirmation) {
        return response.status(400).json({
            error: 'Missing fields',
            message: 'userId and password are required'
        });
    }

    if (password.length < 6) {
        return response.status(400).json({
            error: 'Weak Password',
            message: 'Password must be at least 6 characters long'
        });
    }

    if(password != password_confirmation) {
        return response.status(403).json({
            error: 'Password Mismatch',
            message: 'Password provided do not match'
        })
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return response.status(404).json({
                error: 'User Not Found',
                message: 'No user found with the provided ID'
            });
        }

        if (user.password) {
            return response.status(400).json({
                error: 'Password Already Set',
                message: 'This user already has a password. Use login instead.'
            });
        }

        const hashedPassword = await argon2.hash(password);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        const otp = await generateOtp();
        const message = `Your Food Bank one-time password is: ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;
        // console.log(user.phone);
        
        await storeOtp(user.id, otp);
        await sendSMS(user.phone, message);

        return response.status(200).json({
            nextStep: 'verify_otp',
            message: 'OTP has been sent to your phone',
            userId: user.id
        });

    } catch (error) {
        console.error('Set password error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not set password'
        });
    }
}

export async function verifyPassword(request: Request, response: Response) {
    const { userId, password } = request.body;

    if (!userId || !password) {
        return response.status(400).json({
            error: 'Missing fields',
            message: 'userId and password are required'
        });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.password) {
            return response.status(400).json({
                error: 'Invalid Request',
                message: 'User not found or password not set'
            });
        }

        const passwordMatch = await argon2.verify(user.password, password);

        if (!passwordMatch) {
            return response.status(401).json({
                error: 'Authentication Failed',
                message: 'Incorrect password'
            });
        }

        const otp = await generateOtp();
        const message = `Your Food Bank one-time password is: ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;
        await storeOtp(user.id, otp);
        await sendSMS(user.phone, message)

        return response.status(200).json({
            nextStep: 'verify_otp',
            message: 'OTP has been sent to your phone',
            userId: user.id
        });

    } catch (error) {
        console.error('Password verification error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not verify password'
        });
    }
}

export async function verifyOtp(request: Request, response: Response) {
    const { userId, otp } = request.body;

    if (!userId || !otp) {
        return response.status(400).json({
            error: 'Missing fields',
            message: 'userId and otp are required'
        });
    }

    try {
        const isValid = await verifyStoredOtp(userId, otp);

        if (!isValid) {
            return response.status(401).json({
                error: 'Invalid OTP',
                message: 'The OTP provided is incorrect or has expired'
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const token = jwt.sign({ user }, Config.secret, { expiresIn: '24h' });

        return response.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not verify OTP'
        });
    }
}

export async function logoutUser(request: Request, response: Response) {
    try {
       response.clearCookie('jwt');
       response.status(200).json({ message: 'Logout successful' }) 
    } catch (error) {
        console.error('Error during logout:', error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}