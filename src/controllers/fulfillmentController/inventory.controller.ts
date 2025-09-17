import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as InventoryService from '../../services/adminServices/inventory.service';
import { validationResult } from "express-validator";
import { validateInventory } from "../../validators/inventoryValidator";
import slugify from "slugify";

const prisma = new PrismaClient;

export async function getAllInventory(request: Request, response: Response) {
    try {
        const allInventories = await InventoryService.getAll()
        if(allInventories.length <= 0){
            return response.status(200).json({ message: 'No Inventory(s) Found', data:allInventories });
        }
        return response.status(200).json({message: 'Inventory(s) fetched', data: allInventories });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleInventory(request: Request, response: Response) {
    const id: string = request.query.inventory_id as string;

    if (!id) {
       return response.status(400).json({status:"error", message: 'Inventory ID is expected' }); 
    }
    
    try {
        const singleInventory = await InventoryService.getOne(id)
        return response.status(200).json({message: 'Inventory fetched', data: singleInventory });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function createInventory(request: Request, response: Response) {
    try {
        await Promise.all(validateInventory.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            variantId,
            quantity,
            lowStockLevel,
            batchNumber,
            warehouseId
        } = request.body;

        const inventory = await InventoryService.create({
            variantId,
            quantity,
            lowStockLevel,
            batchNumber,
            warehouseId
        });

        return response.status(201).json({
            status: "success",
            message: "Inventory created successfully",
            data: inventory,
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

export async function updateInventory(request: Request, response: Response) {
    const id: string = request.query.inventory_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Inventory ID is expected" });
    }

    try {
        await Promise.all(validateInventory.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            variantId,
            quantity,
            lowStockLevel,
            batchNumber,
            warehouseId
        } = request.body;

        const updatedInventory = await InventoryService.update(id, {
            variantId,
            quantity,
            lowStockLevel,
            batchNumber,
            warehouseId
        });

        return response.status(200).json({ status: "success", message: "Inventory updated successfully", data: updatedInventory, });

    } catch (error: any) {
        console.error("Inventory update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteInventory(request: Request, response: Response) {
    const id: string = request.query.inventory_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Inventory ID is expected" });
    }

    try {
        const deleteInventory = await InventoryService.remove(id);

        return response.status(200).json({ status: "success", message: "Inventory delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Inventory update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}