import { validationResult } from "express-validator";
import { validateCashier } from "../../validators/cashierValidator";
import { Request, Response } from "express";
import * as CashierService from '../../services/adminServices/cashier.service';
import * as argon2 from "argon2";
import { PrismaClient } from "../../models";
import { sendWelcomeEmail } from "../../utils/emailSender";

const prisma = new PrismaClient();

export async function createCashier(request: Request, response: Response) {
    try {
        await Promise.all(validateCashier.map((rule) => rule.run(request)));

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

        const existing = await prisma.cashier.findUnique({ where: { email } });
        if (existing?.email) {
            return response.status(400).json({ message: 'Email already registered' });
        }

        if (existing?.username) {
            return response.status(400).json({ message: 'Username already registered' });
        }

        const user = await CashierService.create({
            firstname,
            lastname,
            email,
            username,
            password,
        });

        await sendWelcomeEmail(email, 'Welcome to Enugu State Food Scheme – Your Journey Starts Here! 🚀', { user }, pass);

        return response.status(201).json({
            status: "success",
            message: "Cashier created successfully",
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

export async function getAllCashier(request: Request, response: Response) {
    try {
        const allCashiers = await CashierService.getAll()
        if(allCashiers.length <= 0){
            return response.status(200).json({ message: 'No Cashier Cashier(s) Found', data:allCashiers });
        }
        return response.status(200).json({message: 'Cashier Cashier(s) fetched', data: allCashiers });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleCashier(request: Request, response: Response) {
    const id: number = parseInt(request.query.user_id as string);

    if (!id) {
       return response.status(400).json({status:"error", message: 'Cashier Cashier ID is expected' }); 
    }
    
    try {
        const singleCashier = await CashierService.getOne(id)
        return response.status(200).json({message: 'Cashier Cashier fetched', data: singleCashier });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function updateCashier(request: Request, response: Response) {
    const id: number = parseInt(request.query.user_id as string);

    if (!id) {
        return response.status(400).json({ status: "error", message: "Cashier Cashier ID is expected" });
    }

    try {
        await Promise.all(validateCashier.map((rule) => rule.run(request)));

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

        const updatedCashier = await CashierService.update(id, {
            firstname,
            lastname,
            email,
            username,
        });

        return response.status(200).json({ status: "success", message: "Cashier Cashier updated successfully", data: updatedCashier, });

    } catch (error: any) {
        console.error("Cashier Cashier update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteCashier(request: Request, response: Response) {
    const id: number = parseInt(request.query.user_id as string);

    if (!id) {
        return response.status(400).json({ status: "error", message: "Cashier Cashier ID is expected" });
    }

    try {
        const deleteCashier = await CashierService.remove(id);

        return response.status(200).json({ status: "success", message: "Cashier Cashier delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Cashier Cashier update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}