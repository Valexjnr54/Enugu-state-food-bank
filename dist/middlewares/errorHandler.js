"use strict";
// middlewares/errorHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof errors_1.AppError ? err.statusCode : 500;
    res.status(statusCode).json({
        status: "error",
        message: err.message || "Internal server error",
    });
};
exports.errorHandler = errorHandler;
