"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSmsError = handleSmsError;
// utils/handleSmsError.ts
const axios_1 = __importDefault(require("axios"));
function handleSmsError(error, context = "SMS") {
    if (axios_1.default.isAxiosError(error)) {
        console.error(`[${context}] Axios error:`, error.response?.data || error.message);
    }
    else if (error instanceof Error) {
        console.error(`[${context}] Unknown error:`, error.message);
    }
    else {
        console.error(`[${context}] Non-standard error:`, error);
    }
}
