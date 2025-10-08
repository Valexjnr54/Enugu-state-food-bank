"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.initiateLogin = initiateLogin;
exports.setPassword = setPassword;
exports.setPhoneNumber = setPhoneNumber;
exports.verifyPassword = verifyPassword;
exports.verifyOtp = verifyOtp;
exports.resendOtp = resendOtp;
exports.logoutUser = logoutUser;
const models_1 = require("../../models");
const argon2 = __importStar(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config/config");
const express_validator_1 = require("express-validator");
const userValidator_1 = require("../../validators/userValidator");
const otpHandler_1 = require("../../utils/otpHandler");
const sendSMS_1 = require("../../utils/sendSMS");
const prisma = new models_1.PrismaClient();
async function registerUser(request, response) {
    try {
        await Promise.all(userValidator_1.validateUser.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { firstname, lastname, email, phone, level, employee_id, verification_id, government_entity, salary_per_month, password } = request.body;
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
            return response.status(400).json({ message: 'Email/Phone Number/Employee ID already exists' });
        }
        const hashedPassword = await argon2.hash(password);
        const percent = 30 / 100;
        const loan_unit = (percent * parseFloat(salary_per_month));
        const user = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                level,
                phone,
                employee_id,
                verification_id,
                government_entity,
                salary_per_month: parseFloat(salary_per_month),
                loan_unit,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign(user, config_1.Config.secret, { expiresIn: '24h' });
        return response.status(200).json({
            success: true,
            status: 'Successful',
            message: 'Registration Successful',
            token,
            user
        });
    }
    catch (error) {
        console.error('Error registering an user:', error);
        response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function initiateLogin(request, response) {
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
                    { verification_id: identifier },
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
        if (!user.phone) {
            return response.status(200).json({
                nextStep: 'set_phone_number',
                message: 'User must set a new phone number',
                userId: user.id
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
    }
    catch (error) {
        console.error('Initiate login error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not process login initiation'
        });
    }
}
async function setPassword(request, response) {
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
    if (password != password_confirmation) {
        return response.status(403).json({
            error: 'Password Mismatch',
            message: 'Password provided do not match'
        });
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
        const otp = await (0, otpHandler_1.generateOtp)();
        const message = `Your Food Bank one-time password is: ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;
        // console.log(user.phone);
        await (0, otpHandler_1.storeOtp)(user.id, otp);
        if (user.phone) {
            await (0, sendSMS_1.sendSMS)(user.phone, message);
        }
        else {
            return response.status(400).json({
                error: 'Missing phone number',
                message: 'User does not have a phone number on record'
            });
        }
        return response.status(200).json({
            nextStep: 'verify_otp',
            message: 'OTP has been sent to your phone',
            userId: user.id
        });
    }
    catch (error) {
        console.error('Set password error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not set password'
        });
    }
}
async function setPhoneNumber(request, response) {
    const { userId, phone_number } = request.body;
    if (!userId || !phone_number) {
        return response.status(400).json({
            error: 'Missing fields',
            message: 'userId and phone number are required'
        });
    }
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return response.status(404).json({
                error: 'User Not Found',
                message: 'No user found with the provided ID'
            });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { phone: phone_number }
        });
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
    }
    catch (error) {
        console.error('Set password error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not set password'
        });
    }
}
async function verifyPassword(request, response) {
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
        const otp = await (0, otpHandler_1.generateOtp)();
        const message = `Your Food Bank one-time password is: ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;
        await (0, otpHandler_1.storeOtp)(user.id, otp);
        if (user.phone) {
            await (0, sendSMS_1.sendSMS)(user.phone, message);
        }
        else {
            return response.status(400).json({
                error: 'Missing phone number',
                message: 'User does not have a phone number on record'
            });
        }
        return response.status(200).json({
            nextStep: 'verify_otp',
            message: 'OTP has been sent to your phone',
            userId: user.id
        });
    }
    catch (error) {
        console.error('Password verification error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not verify password'
        });
    }
}
async function verifyOtp(request, response) {
    const { userId, otp } = request.body;
    if (!userId || !otp) {
        return response.status(400).json({
            error: 'Missing fields',
            message: 'userId and otp are required'
        });
    }
    try {
        const isValid = await (0, otpHandler_1.verifyStoredOtp)(userId, otp);
        if (!isValid) {
            return response.status(401).json({
                error: 'Invalid OTP',
                message: 'The OTP provided is incorrect or has expired'
            });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const token = jsonwebtoken_1.default.sign({ user }, config_1.Config.secret, { expiresIn: '24h' });
        return response.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user
        });
    }
    catch (error) {
        console.error('OTP verification error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not verify OTP'
        });
    }
}
async function resendOtp(request, response) {
    const { userId } = request.body;
    if (!userId) {
        return response.status(400).json({
            error: 'Missing fields',
            message: 'userId is required'
        });
    }
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return response.status(404).json("User Not Found");
        }
        const otp = user.otp;
        const message = `Your Food Bank one-time password is: ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;
        if (user.phone) {
            await (0, sendSMS_1.sendSMS)(user.phone, message);
        }
        else {
            return response.status(400).json({
                error: 'Missing phone number',
                message: 'User does not have a phone number on record'
            });
        }
        return response.status(200).json({
            nextStep: 'verify_otp',
            message: 'OTP has been resent to your phone',
            userId: user.id
        });
    }
    catch (error) {
        console.error('OTP verification error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'Could not verify OTP'
        });
    }
}
async function logoutUser(request, response) {
    try {
        response.clearCookie('jwt');
        response.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Error during logout:', error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
