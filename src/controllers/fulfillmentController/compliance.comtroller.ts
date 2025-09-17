import { Request, Response } from "express";
import fs from "fs";
import * as ComplianceFormService from "../../services/userServices/compliance.service"

export async function get_all_compliance(request: Request, response: Response) {
    try {
        const allComplianceForm = await ComplianceFormService.getAll()
        return response.status(200).json({message: 'Compliance Form fetched', data: allComplianceForm });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function approve_deny_compliance(request: Request, response: Response) {
    const id: string = request.query.compliance_id as string;
    const { status } = request.body;

    if (!id) {
       return response.status(400).json({status:"error", message: 'Compliance ID is expected' }); 
    }

    if (!['APPROVED', 'DENIED'].includes(status)) {
        return response.status(400).json({status:"error", message: 'Status must be either APPROVED or DENIED' }); 
    }

    try {
        const updateComplianceForm = await ComplianceFormService.update(id, {status})

        if (!updateComplianceForm) {
            return response.status(400).json({status:"error", message: 'Compliance Form Status was not updated' }); 
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

        return response.status(200).json({message: 'Compliance Form status updated', data: complianceForm });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function get_compliance(request: Request, response: Response) {
    const id: string = request.query.compliance_id as string;
    try {
        if (!id) {
       return response.status(400).json({status:"error", message: 'Compliance ID is expected' }); 
    }
        const singleComplianceForm = await ComplianceFormService.getOne(id)
        return response.status(200).json({message: 'Compliance Form fetched', data: singleComplianceForm });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}