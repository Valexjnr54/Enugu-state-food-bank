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
exports.createOfficer = createOfficer;
exports.getAllOfficer = getAllOfficer;
exports.getSingleOfficer = getSingleOfficer;
exports.updateOfficer = updateOfficer;
exports.deleteOfficer = deleteOfficer;
const express_validator_1 = require("express-validator");
const officerValidator_1 = require("../../validators/officerValidator");
const OfficerService = __importStar(require("../../services/adminServices/fulfillment.officer.service"));
const argon2 = __importStar(require("argon2"));
const models_1 = require("../../models");
const emailSender_1 = require("../../utils/emailSender");
const prisma = new models_1.PrismaClient();
async function createOfficer(request, response) {
    try {
        await Promise.all(officerValidator_1.validateOfficer.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const pass = "p@55word";
        const password = await argon2.hash(pass);
        const { firstname, lastname, email, username, } = request.body;
        const existing = await prisma.fulfillment_officers.findUnique({ where: { email } });
        if (existing?.email) {
            return response.status(400).json({ message: 'Email already registered' });
        }
        if (existing?.username) {
            return response.status(400).json({ message: 'Username already registered' });
        }
        const user = await OfficerService.create({
            firstname,
            lastname,
            email,
            username,
            password,
        });
        await (0, emailSender_1.sendWelcomeEmail)(email, 'Welcome to Enugu State Food Scheme – Your Journey Starts Here! 🚀', { user }, pass);
        return response.status(201).json({
            status: "success",
            message: "Fulfillment created successfully",
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
async function getAllOfficer(request, response) {
    try {
        const allOfficers = await OfficerService.getAll();
        if (allOfficers.length <= 0) {
            return response.status(200).json({ message: 'No Fulfillment Officer(s) Found', data: allOfficers });
        }
        return response.status(200).json({ message: 'Fulfillment Officer(s) fetched', data: allOfficers });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleOfficer(request, response) {
    const id = parseInt(request.query.user_id);
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Fulfillment Officer ID is expected' });
    }
    try {
        const singleOfficer = await OfficerService.getOne(id);
        return response.status(200).json({ message: 'Fulfillment Officer fetched', data: singleOfficer });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function updateOfficer(request, response) {
    const id = parseInt(request.query.user_id);
    if (!id) {
        return response.status(400).json({ status: "error", message: "Fulfillment Officer ID is expected" });
    }
    try {
        await Promise.all(officerValidator_1.validateOfficer.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { firstname, lastname, email, username, } = request.body;
        const updatedOfficer = await OfficerService.update(id, {
            firstname,
            lastname,
            email,
            username,
        });
        return response.status(200).json({ status: "success", message: "Fulfillment Officer updated successfully", data: updatedOfficer, });
    }
    catch (error) {
        console.error("Fulfillment Officer update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteOfficer(request, response) {
    const id = parseInt(request.query.user_id);
    if (!id) {
        return response.status(400).json({ status: "error", message: "Fulfillment Officer ID is expected" });
    }
    try {
        const deleteOfficer = await OfficerService.remove(id);
        return response.status(200).json({ status: "success", message: "Fulfillment Officer delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Fulfillment Officer update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
