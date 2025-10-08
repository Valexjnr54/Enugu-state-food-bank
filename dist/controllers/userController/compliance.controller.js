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
exports.add_compliance = add_compliance;
exports.get_compliance = get_compliance;
const cloudinary_1 = require("../../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
const ComplianceFormService = __importStar(require("../../services/userServices/compliance.service"));
async function add_compliance(request, response) {
    const userId = request.user.user.id;
    try {
        const files = request.files;
        let form_url;
        // Upload single product_image
        if (files["compliance_form"]?.[0]) {
            const filePath = files["compliance_form"][0].path;
            form_url = await (0, cloudinary_1.uploadImage)(filePath, "compliance_form");
            // Optional: remove local file
            fs_1.default.unlink(filePath, () => { });
        }
        const compliance_form = await ComplianceFormService.createOrUpdate({
            userId,
            form_url
        });
        await ComplianceFormService.updateUserSubmission(userId);
        return response.status(201).json({
            status: "success",
            message: "Compliance Form Submitted Successfully",
            data: compliance_form,
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
async function get_compliance(request, response) {
    const userId = request.user.user.id;
    try {
        if (!userId) {
            return response.status(400).json({ status: "error", message: 'User is expected' });
        }
        const singleComplianceForm = await ComplianceFormService.getByUserId(userId);
        return response.status(200).json({ message: 'Compliance Form fetched', data: singleComplianceForm });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
