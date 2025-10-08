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
exports.getAllUser = getAllUser;
exports.getSingleUser = getSingleUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.uploadUsersFromCSV = uploadUsersFromCSV;
exports.downloadUserTemplate = downloadUserTemplate;
const models_1 = require("../../models");
const UserService = __importStar(require("../../services/adminServices/user.service"));
const express_validator_1 = require("express-validator");
const userValidator_1 = require("../../validators/userValidator");
const library_1 = require("../../models/runtime/library");
const path_1 = __importDefault(require("path"));
const prisma = new models_1.PrismaClient;
async function getAllUser(request, response) {
    try {
        const allUsers = await UserService.getAll();
        if (allUsers.length <= 0) {
            return response.status(200).json({ message: 'No User(s) Found', data: allUsers });
        }
        return response.status(200).json({ message: 'User(s) fetched', data: allUsers });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleUser(request, response) {
    const id = request.query.user_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'User ID is expected' });
    }
    try {
        const singleUser = await UserService.getOne(id);
        return response.status(200).json({ message: 'User fetched', data: singleUser });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function createUser(request, response) {
    try {
        await Promise.all(userValidator_1.validateUser.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { firstname, lastname, email, phone, level, employee_id, verification_id, government_entity, salary_per_month, } = request.body;
        const percent = 30 / 100;
        const loan_unit = (percent * parseFloat(salary_per_month));
        const user = await UserService.create({
            firstname,
            lastname,
            email,
            phone,
            level,
            employee_id,
            verification_id,
            government_entity,
            salary_per_month,
            loan_unit
        });
        return response.status(201).json({
            status: "success",
            message: "User created successfully",
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
async function updateUser(request, response) {
    const id = request.query.user_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "User ID is expected" });
    }
    try {
        await Promise.all(userValidator_1.validateUser.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { firstname, lastname, email, phone, level, employee_id, government_entity, salary_per_month, } = request.body;
        const percent = 30 / 100;
        const loan_unit = (percent * parseFloat(salary_per_month));
        const updatedUser = await UserService.update(id, {
            firstname,
            lastname,
            email,
            phone,
            level,
            employee_id,
            government_entity,
            salary_per_month,
            loan_unit
        });
        return response.status(200).json({ status: "success", message: "User updated successfully", data: updatedUser, });
    }
    catch (error) {
        console.error("User update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteUser(request, response) {
    const id = request.query.user_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "User ID is expected" });
    }
    try {
        const deleteUser = await UserService.remove(id);
        return response.status(200).json({ status: "success", message: "User delete successfully", data: {}, });
    }
    catch (error) {
        console.error("User update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
// Helper to run validation against a plain object
const runValidation = async (data, validations) => {
    const fakeReq = {
        body: data,
        headers: {},
        get: () => "", // Required by express-validator
    };
    for (const validation of validations) {
        await validation.run(fakeReq);
    }
    const result = (0, express_validator_1.validationResult)(fakeReq);
    return result;
};
async function uploadUsersFromCSV(request, response) {
    if (!request.file) {
        return response.status(400).json({ error: "CSV file is required" });
    }
    const results = [];
    const errors = [];
    const content = request.file.buffer.toString("utf-8");
    const rows = content.split("\n").map((line) => line.trim()).filter(Boolean);
    const headers = rows[0].split(",").map((h) => h.trim());
    const percent = 30 / 100;
    // Use batch size for large uploads
    const BATCH_SIZE = 100;
    let batch = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(",").map((v) => v.trim());
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = values[index];
        });
        // Set email and phone to null if empty
        if (!rowData.email || rowData.email === "") {
            rowData.email = null;
        }
        if (!rowData.phone || rowData.phone === "") {
            rowData.phone = null;
        }
        // Convert float fields
        rowData.salary_per_month = parseFloat(rowData.salary_per_month);
        const loan_unit = percent * rowData.salary_per_month;
        // Run validation on this row
        const result = await runValidation(rowData, userValidator_1.validateUser);
        if (!result.isEmpty()) {
            errors.push({
                row: i + 1,
                errors: result.array(),
            });
            continue;
        }
        batch.push({ ...rowData, loan_unit });
        // Process batch if batch size reached or last row
        if (batch.length === BATCH_SIZE || i === rows.length - 1) {
            // Use Promise.allSettled for concurrency
            const batchResults = await Promise.allSettled(batch.map(async (userData) => {
                try {
                    // Check for existing user by verification_id
                    const existingUser = await prisma.user.findUnique({
                        where: { verification_id: userData.verification_id },
                    });
                    if (existingUser) {
                        if (existingUser.loan_amount_collected > 0) {
                            // Skip if loan_amount_collected > 0
                            return { skipped: true, verification_id: userData.verification_id };
                        }
                        else {
                            // Update if loan_amount_collected == 0
                            const updated = await prisma.user.update({
                                where: { verification_id: userData.verification_id },
                                data: userData,
                            });
                            results.push(updated);
                            return { updated: true, verification_id: userData.verification_id };
                        }
                    }
                    else {
                        // Create new user
                        const savedUser = await UserService.create(userData);
                        results.push(savedUser);
                        return { created: true, verification_id: userData.verification_id };
                    }
                }
                catch (err) {
                    if (err instanceof library_1.PrismaClientKnownRequestError) {
                        errors.push({ row: i + 1, message: err.message });
                    }
                    else {
                        errors.push({ row: i + 1, message: "Unknown error" });
                    }
                    return { error: true, verification_id: userData.verification_id };
                }
            }));
            batch = [];
        }
    }
    return response.status(201).json({
        message: `${results.length} user(s) uploaded/updated successfully.`,
        success: results,
        failed: errors,
    });
}
async function downloadUserTemplate(request, response) {
    const filePath = path_1.default.resolve("./public/templates/user_upload_template.csv");
    response.download(filePath, "user_upload_template.csv", (error) => {
        if (error) {
            console.error("❌ Error sending template file:", error);
            response.status(500).json({ error: "Could not download template file." });
        }
    });
}
;
