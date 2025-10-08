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
exports.getAllInventory = getAllInventory;
exports.getSingleInventory = getSingleInventory;
exports.createInventory = createInventory;
exports.updateInventory = updateInventory;
exports.deleteInventory = deleteInventory;
const models_1 = require("../../models");
const InventoryService = __importStar(require("../../services/adminServices/inventory.service"));
const express_validator_1 = require("express-validator");
const inventoryValidator_1 = require("../../validators/inventoryValidator");
const prisma = new models_1.PrismaClient;
async function getAllInventory(request, response) {
    try {
        const allInventories = await InventoryService.getAll();
        if (allInventories.length <= 0) {
            return response.status(200).json({ message: 'No Inventory(s) Found', data: allInventories });
        }
        return response.status(200).json({ message: 'Inventory(s) fetched', data: allInventories });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleInventory(request, response) {
    const id = request.query.inventory_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Inventory ID is expected' });
    }
    try {
        const singleInventory = await InventoryService.getOne(id);
        return response.status(200).json({ message: 'Inventory fetched', data: singleInventory });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function createInventory(request, response) {
    try {
        await Promise.all(inventoryValidator_1.validateInventory.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { variantId, quantity, lowStockLevel, batchNumber, warehouseId } = request.body;
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
async function updateInventory(request, response) {
    const id = request.query.inventory_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Inventory ID is expected" });
    }
    try {
        await Promise.all(inventoryValidator_1.validateInventory.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { variantId, quantity, lowStockLevel, batchNumber, warehouseId } = request.body;
        const updatedInventory = await InventoryService.update(id, {
            variantId,
            quantity,
            lowStockLevel,
            batchNumber,
            warehouseId
        });
        return response.status(200).json({ status: "success", message: "Inventory updated successfully", data: updatedInventory, });
    }
    catch (error) {
        console.error("Inventory update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteInventory(request, response) {
    const id = request.query.inventory_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Inventory ID is expected" });
    }
    try {
        const deleteInventory = await InventoryService.remove(id);
        return response.status(200).json({ status: "success", message: "Inventory delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Inventory update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
