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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCashier = createCashier;
exports.getAllCashier = getAllCashier;
exports.getSingleCashier = getSingleCashier;
exports.updateCashier = updateCashier;
exports.deleteCashier = deleteCashier;
const express_validator_1 = require("express-validator");
const cashierValidator_1 = require("../../validators/cashierValidator");
const CashierService = __importStar(require("../../services/adminServices/cashier.service"));
const argon2 = __importStar(require("argon2"));
const models_1 = require("../../models");
const emailSender_1 = require("../../utils/emailSender");
const prisma = new models_1.PrismaClient();
async function createCashier(request, response) {
    try {
        await Promise.all(cashierValidator_1.validateCashier.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const pass = "p@55word";
        const password = await argon2.hash(pass);
        const { firstname, lastname, email, username, } = request.body;
        const existing = await prisma.cashier.findUnique({ where: { email } });
        if (existing?.email) {
            return response.status(400).json({ message: 'Email already registered' });
        }
        if (existing?.username) {
            return response.status(400).json({ message: 'Username already registered' });
        }
        const user = await CashierService.create({
            firstname,
            lastname,
            email,
            username,
            password,
        });
        await (0, emailSender_1.sendWelcomeEmail)(email, 'Welcome to Enugu State Food Scheme – Your Journey Starts Here! 🚀', { user }, pass);
        return response.status(201).json({
            status: "success",
            message: "Cashier created successfully",
            data: user,
        });
    }
    catch (error) {
        if (error.name === "ZodError") {
            console.log(error);
            return response.status(400).json({ message: "Validation failed", errors: error.errors });
        }
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}
async function getAllCashier(request, response) {
    try {
        const allCashiers = await CashierService.getAll();
        if (allCashiers.length <= 0) {
            return response.status(200).json({ message: 'No Cashier Cashier(s) Found', data: allCashiers });
        }
        return response.status(200).json({ message: 'Cashier Cashier(s) fetched', data: allCashiers });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleCashier(request, response) {
    const id = parseInt(request.query.user_id);
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Cashier Cashier ID is expected' });
    }
    try {
        const singleCashier = await CashierService.getOne(id);
        return response.status(200).json({ message: 'Cashier Cashier fetched', data: singleCashier });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function updateCashier(request, response) {
    const id = parseInt(request.query.user_id);
    if (!id) {
        return response.status(400).json({ status: "error", message: "Cashier Cashier ID is expected" });
    }
    try {
        await Promise.all(cashierValidator_1.validateCashier.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { firstname, lastname, email, username, } = request.body;
        const updatedCashier = await CashierService.update(id, {
            firstname,
            lastname,
            email,
            username,
        });
        return response.status(200).json({ status: "success", message: "Cashier Cashier updated successfully", data: updatedCashier, });
    }
    catch (error) {
        console.error("Cashier Cashier update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteCashier(request, response) {
    const id = parseInt(request.query.user_id);
    if (!id) {
        return response.status(400).json({ status: "error", message: "Cashier Cashier ID is expected" });
    }
    try {
        const deleteCashier = await CashierService.remove(id);
        return response.status(200).json({ status: "success", message: "Cashier Cashier delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Cashier Cashier update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
