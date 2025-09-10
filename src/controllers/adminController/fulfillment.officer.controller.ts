import { validationResult } from "express-validator";
import { validateOfficer } from "../../validators/officerValidator";
import { Request, Response } from "express";
import * as OfficerService from '../../services/adminServices/fulfillment.officer.service';
import * as argon2 from "argon2";
import { PrismaClient } from "../../models";
import { sendWelcomeEmail } from "../../utils/emailSender";

const prisma = new PrismaClient();

export async function createOfficer(request: Request, response: Response) {
    try {
        await Promise.all(validateOfficer.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const pass = "p@55word"
        const password  = await argon2.hash(pass);

        const {
            firstname,
            lastname,
            email,
            username,
        } = request.body;

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

        await sendWelcomeEmail(email, 'Welcome to Enugu State Food Scheme – Your Journey Starts Here! 🚀', { user }, pass);

        return response.status(201).json({
            status: "success",
            message: "Fulfillment created successfully",
            data: user,
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

export async function getAllOfficer(request: Request, response: Response) {
    try {
        const allOfficers = await OfficerService.getAll()
        if(allOfficers.length <= 0){
            return response.status(200).json({ message: 'No Fulfillment Officer(s) Found', data:allOfficers });
        }
        return response.status(200).json({message: 'Fulfillment Officer(s) fetched', data: allOfficers });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleOfficer(request: Request, response: Response) {
    const id: number = parseInt(request.query.user_id as string);

    if (!id) {
       return response.status(400).json({status:"error", message: 'Fulfillment Officer ID is expected' }); 
    }
    
    try {
        const singleOfficer = await OfficerService.getOne(id)
        return response.status(200).json({message: 'Fulfillment Officer fetched', data: singleOfficer });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function updateOfficer(request: Request, response: Response) {
    const id: number = parseInt(request.query.user_id as string);

    if (!id) {
        return response.status(400).json({ status: "error", message: "Fulfillment Officer ID is expected" });
    }

    try {
        await Promise.all(validateOfficer.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            firstname,
            lastname,
            email,
            username,
        } = request.body;

        const updatedOfficer = await OfficerService.update(id, {
            firstname,
            lastname,
            email,
            username,
        });

        return response.status(200).json({ status: "success", message: "Fulfillment Officer updated successfully", data: updatedOfficer, });

    } catch (error: any) {
        console.error("Fulfillment Officer update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteOfficer(request: Request, response: Response) {
    const id: number = parseInt(request.query.user_id as string);

    if (!id) {
        return response.status(400).json({ status: "error", message: "Fulfillment Officer ID is expected" });
    }

    try {
        const deleteOfficer = await OfficerService.remove(id);

        return response.status(200).json({ status: "success", message: "Fulfillment Officer delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Fulfillment Officer update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}