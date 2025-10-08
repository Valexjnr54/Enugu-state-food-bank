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
exports.get_all_compliance = get_all_compliance;
exports.approve_deny_compliance = approve_deny_compliance;
exports.get_compliance = get_compliance;
const ComplianceFormService = __importStar(require("../../services/userServices/compliance.service"));
async function get_all_compliance(request, response) {
    try {
        const allComplianceForm = await ComplianceFormService.getAll();
        return response.status(200).json({ message: 'Compliance Form fetched', data: allComplianceForm });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function approve_deny_compliance(request, response) {
    const id = request.query.compliance_id;
    const { status } = request.body;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Compliance ID is expected' });
    }
    if (!['APPROVED', 'DENIED'].includes(status)) {
        return response.status(400).json({ status: "error", message: 'Status must be either APPROVED or DENIED' });
    }
    try {
        const updateComplianceForm = await ComplianceFormService.update(id, { status });
        if (!updateComplianceForm) {
            return response.status(400).json({ status: "error", message: 'Compliance Form Status was not updated' });
        }
        // If status is APPROVED, update user status to ACTIVE
        if (status === 'APPROVED') {
            await ComplianceFormService.updateUserStatus(updateComplianceForm.userId, 'ACTIVE');
        }
        // If status is REJECTED, you might want to keep user as PENDING
        // or handle it differently based on your business logic
        if (status === 'DENIED') {
            await ComplianceFormService.updateUserStatus(updateComplianceForm.userId, 'PENDING');
        }
        const complianceForm = await ComplianceFormService.getOne(id);
        return response.status(200).json({ message: 'Compliance Form status updated', data: complianceForm });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function get_compliance(request, response) {
    const id = request.query.compliance_id;
    try {
        if (!id) {
            return response.status(400).json({ status: "error", message: 'Compliance ID is expected' });
        }
        const singleComplianceForm = await ComplianceFormService.getOne(id);
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
