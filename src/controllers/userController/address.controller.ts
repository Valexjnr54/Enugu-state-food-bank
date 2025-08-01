import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as AddressService from '../../services/userServices/address.service';
import * as UserService from '../../services/adminServices/user.service';
import { validationResult } from "express-validator";
import { validateAddress } from "../../validators/addressValidator";

const prisma = new PrismaClient;

export async function getAllAddress(request: Request, response: Response) {
    try {
        const allAddresss = await AddressService.getAllByUser(request.user.user.id)
        if(allAddresss.length <= 0){
            return response.status(200).json({ message: 'No Address(s) Found', data:allAddresss });
        }
        return response.status(200).json({message: 'Address(s) fetched', data: allAddresss });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleAddress(request: Request, response: Response) {
    const id: string = request.query.address_id as string;

    if (!id) {
       return response.status(400).json({status:"error", message: 'Address ID is expected' }); 
    }
    
    try {
        const singleAddress = await AddressService.getOne(id)
        return response.status(200).json({message: 'Address fetched', data: singleAddress });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function createAddress(request: Request, response: Response) {
    try {
        await Promise.all(validateAddress.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const userId = request.user.user.id

        const {
            label,
            street,
            city,
            state,
            country,
            zipCode
        } = request.body;
        

        // Check if user has any existing addresses
        const existingAddresses = await AddressService.findOne(userId);

        if (existingAddresses != null) {
            const address = await AddressService.create({
                userId,
                label,
                street,
                city,
                state,
                country,
                zipCode
            });

            return response.status(201).json({
                status: "success",
                message: "Address created successfully",
                data: address,
            });
        }
        
        const isDefault = true; // true if no existing addresses

        const address = await AddressService.create({
            userId,
            label,
            street,
            city,
            state,
            country,
            zipCode,
            isDefault // Add this field
        });

        await UserService.update(request.user.user.id, {
            is_address_set:true,
        });

        return response.status(201).json({
            status: "success",
            message: "Address created successfully",
            data: address,
        });

    } catch (error: any) {
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}

export async function updateAddress(request: Request, response: Response) {
    const id: string = request.query.address_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Address ID is expected" });
    }

    try {
        await Promise.all(validateAddress.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            userId,
            label,
            street,
            city,
            state,
            country,
            zipCode
        } = request.body;

        const updatedAddress = await AddressService.update(id, {
            userId,
            label,
            street,
            city,
            state,
            country,
            zipCode
        });

        return response.status(200).json({ status: "success", message: "Address updated successfully", data: updatedAddress, });

    } catch (error: any) {
        console.error("Address update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteAddress(request: Request, response: Response) {
    const id: string = request.query.address_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Address ID is expected" });
    }

    try {
        const deleteAddress = await AddressService.remove(id);

        return response.status(200).json({ status: "success", message: "Address delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Address update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}