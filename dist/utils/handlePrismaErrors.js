"use strict";
// utils/handlePrismaError.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = void 0;
const library_1 = require("../models/runtime/library");
const errors_1 = require("./errors");
const handlePrismaError = (error) => {
    if (error instanceof library_1.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2025":
                throw new errors_1.AppError("Record not found.", 404);
            case "P2002":
                throw new errors_1.AppError("Duplicate record error.", 409);
            case "P2003":
                throw new errors_1.AppError("Foreign key constraint failed.", 400);
            default:
                throw new errors_1.AppError("Database error occurred.", 500);
        }
    }
    // If it's a normal Error object
    if (error instanceof Error) {
        throw new errors_1.AppError(error.message, 500);
    }
    // Unknown case
    throw new errors_1.AppError("Unknown server error.", 500);
};
exports.handlePrismaError = handlePrismaError;
