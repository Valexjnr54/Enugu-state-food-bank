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

    try {
        const allComplianceForm = await ComplianceFormService.update(id, {status})
        return response.status(200).json({message: 'Compliance Form fetched', data: allComplianceForm });
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