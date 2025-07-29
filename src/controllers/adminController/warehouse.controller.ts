import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as WarehouseService from '../../services/adminServices/warehouse.service';
import { validationResult } from "express-validator";
import { validateWarehouse } from "../../validators/warehouseValidator";
import slugify from "slugify";

const prisma = new PrismaClient;

export async function getAllWarehouse(request: Request, response: Response) {
    try {
        const allWarehouses = await WarehouseService.getAll()
        if(allWarehouses.length <= 0){
            return response.status(200).json({ message: 'No Warehouse(s) Found', data:allWarehouses });
        }
        return response.status(200).json({message: 'Warehouse(s) fetched', data: allWarehouses });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleWarehouse(request: Request, response: Response) {
    const id: string = request.query.warehouse_id as string;

    if (!id) {
       return response.status(400).json({status:"error", message: 'Warehouse ID is expected' }); 
    }
    
    try {
        const singleWarehouse = await WarehouseService.getOne(id)
        return response.status(200).json({message: 'Warehouse fetched', data: singleWarehouse });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function createWarehouse(request: Request, response: Response) {
    try {
        await Promise.all(validateWarehouse.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            address,
            city,
            country,
        } = request.body;

        const warehouse = await WarehouseService.create({
            name,
            address,
            city,
            country,
        });

        return response.status(201).json({
            status: "success",
            message: "Warehouse created successfully",
            data: warehouse,
        });

    } catch (error: any) {
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}

export async function updateWarehouse(request: Request, response: Response) {
    const id: string = request.query.warehouse_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Warehouse ID is expected" });
    }

    try {
        await Promise.all(validateWarehouse.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            address,
            city,
            country,
        } = request.body;

        const updatedWarehouse = await WarehouseService.update(id, {
            name,
            address,
            city,
            country,
        });

        return response.status(200).json({ status: "success", message: "Warehouse updated successfully", data: updatedWarehouse, });

    } catch (error: any) {
        console.error("Warehouse update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteWarehouse(request: Request, response: Response) {
    const id: string = request.query.warehouse_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Warehouse ID is expected" });
    }

    try {
        const deleteWarehouse = await WarehouseService.remove(id);

        return response.status(200).json({ status: "success", message: "Warehouse delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Warehouse update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}