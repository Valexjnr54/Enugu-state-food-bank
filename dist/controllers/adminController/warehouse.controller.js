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
exports.getAllWarehouse = getAllWarehouse;
exports.getSingleWarehouse = getSingleWarehouse;
exports.createWarehouse = createWarehouse;
exports.updateWarehouse = updateWarehouse;
exports.deleteWarehouse = deleteWarehouse;
const models_1 = require("../../models");
const WarehouseService = __importStar(require("../../services/adminServices/warehouse.service"));
const express_validator_1 = require("express-validator");
const warehouseValidator_1 = require("../../validators/warehouseValidator");
const prisma = new models_1.PrismaClient;
async function getAllWarehouse(request, response) {
    try {
        const allWarehouses = await WarehouseService.getAll();
        if (allWarehouses.length <= 0) {
            return response.status(200).json({ message: 'No Warehouse(s) Found', data: allWarehouses });
        }
        return response.status(200).json({ message: 'Warehouse(s) fetched', data: allWarehouses });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleWarehouse(request, response) {
    const id = request.query.warehouse_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Warehouse ID is expected' });
    }
    try {
        const singleWarehouse = await WarehouseService.getOne(id);
        return response.status(200).json({ message: 'Warehouse fetched', data: singleWarehouse });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function createWarehouse(request, response) {
    try {
        await Promise.all(warehouseValidator_1.validateWarehouse.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { name, address, city, country, } = request.body;
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
    }
    catch (error) {
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}
async function updateWarehouse(request, response) {
    const id = request.query.warehouse_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Warehouse ID is expected" });
    }
    try {
        await Promise.all(warehouseValidator_1.validateWarehouse.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { name, address, city, country, } = request.body;
        const updatedWarehouse = await WarehouseService.update(id, {
            name,
            address,
            city,
            country,
        });
        return response.status(200).json({ status: "success", message: "Warehouse updated successfully", data: updatedWarehouse, });
    }
    catch (error) {
        console.error("Warehouse update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteWarehouse(request, response) {
    const id = request.query.warehouse_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Warehouse ID is expected" });
    }
    try {
        const deleteWarehouse = await WarehouseService.remove(id);
        return response.status(200).json({ status: "success", message: "Warehouse delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Warehouse update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
