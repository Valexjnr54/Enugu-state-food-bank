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
exports.registerCashier = registerCashier;
exports.loginCashier = loginCashier;
exports.logoutCashier = logoutCashier;
const models_1 = require("../../models");
const argon2 = __importStar(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config/config");
const requestValidator_1 = require("../../utils/requestValidator");
const express_validator_1 = require("express-validator");
const prisma = new models_1.PrismaClient();
async function registerCashier(request, response) {
    (0, requestValidator_1.validateRequestBody)(['firstname', 'lastname', 'username', 'email', 'password']);
    const { firstname, lastname, username, email, password } = request.body;
    try {
        const validationRules = [
            (0, express_validator_1.body)('firstname').notEmpty().withMessage('First name is required'),
            (0, express_validator_1.body)('lastname').notEmpty().withMessage('Last name is required'),
            (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
            (0, express_validator_1.body)('username').notEmpty().withMessage('Username is reqired'),
            (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        ];
        await Promise.all(validationRules.map(rule => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const existingCashier = await prisma.cashier.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
        if (existingCashier) {
            return response.status(400).json({ message: 'Email/Username already exists' });
        }
        const hashedPassword = await argon2.hash(password);
        const cashier = await prisma.cashier.create({
            data: {
                firstname,
                lastname,
                username,
                email,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign(cashier, config_1.Config.secret, { expiresIn: '24h' });
        return response.status(200).json({
            success: true,
            status: 'Successful',
            message: 'Registration Successful',
            token,
            cashier
        });
    }
    catch (error) {
        console.error('Error registering an cashier:', error);
        response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function loginCashier(request, response) {
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
        const cashier = await prisma.cashier.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier },
                ],
            },
        });
        if (!cashier) {
            return response.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid credentials'
            });
        }
        const passwordMatch = await argon2.verify(cashier.password, password);
        if (!passwordMatch) {
            return response.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email/username or password'
            });
        }
        const token = jsonwebtoken_1.default.sign({ cashier }, config_1.Config.secret, { expiresIn: '24h' });
        return response.status(200).json({
            success: true,
            status: 'Successful',
            message: 'Login Successful',
            token,
            cashier
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occured during login'
        });
    }
}
async function logoutCashier(request, response) {
    try {
        response.clearCookie('jwt');
        response.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Error during logout:', error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
