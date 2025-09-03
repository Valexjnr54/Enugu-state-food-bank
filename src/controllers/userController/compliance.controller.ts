import { Request, Response } from "express";
import { uploadImage } from "../../utils/cloudinary";
import fs from "fs";
import * as ComplianceFormService from "../../services/userServices/compliance.service"
import { update } from '../../services/userServices/compliance.service';

export async function add_compliance(request: Request, response: Response) {
    const userId = request.user.user.id;
    try {
        const files = request.files as {
        [   fieldname: string]: Express.Multer.File[];
        };

        let form_url: string | undefined;

        // Upload single product_image
        if (files["compliance_form"]?.[0]) {
            const filePath = files["compliance_form"][0].path;
            form_url = await uploadImage(filePath, "compliance_form");

            // Optional: remove local file
            fs.unlink(filePath, () => {});
        }

        const compliance_form = await ComplianceFormService.createOrUpdate({
            userId,
            form_url
        });

        await ComplianceFormService.updateUserSubmission(userId)
    
        return response.status(201).json({
            status: "success",
            message: "Compliance Form Submitted Successfully",
            data: compliance_form,
        });
    
    } catch (error: any) {
        if (error.name === "ZodError") {
            console.log(error)
            return response.status(400).json({ message: "Validation failed", errors: error.errors });
        }

        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}

export async function get_compliance(request: Request, response: Response) {
    const userId = request.user.user.id;
    try {
        if (!userId) {
            return response.status(400).json({status:"error", message: 'User is expected' }); 
        }
        const singleComplianceForm = await ComplianceFormService.getByUserId(userId)
        return response.status(200).json({message: 'Compliance Form fetched', data: singleComplianceForm });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}