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
exports.getAllAddress = getAllAddress;
exports.getSingleAddress = getSingleAddress;
exports.createAddress = createAddress;
exports.updateAddress = updateAddress;
exports.deleteAddress = deleteAddress;
const models_1 = require("../../models");
const AddressService = __importStar(require("../../services/userServices/address.service"));
const UserService = __importStar(require("../../services/adminServices/user.service"));
const express_validator_1 = require("express-validator");
const addressValidator_1 = require("../../validators/addressValidator");
const prisma = new models_1.PrismaClient;
async function getAllAddress(request, response) {
    try {
        const allAddresss = await AddressService.getAllByUser(request.user.user.id);
        if (allAddresss.length <= 0) {
            return response.status(200).json({ message: 'No Address(s) Found', data: allAddresss });
        }
        return response.status(200).json({ message: 'Address(s) fetched', data: allAddresss });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleAddress(request, response) {
    const id = request.query.address_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Address ID is expected' });
    }
    try {
        const singleAddress = await AddressService.getOne(id);
        return response.status(200).json({ message: 'Address fetched', data: singleAddress });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function createAddress(request, response) {
    try {
        await Promise.all(addressValidator_1.validateAddress.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const userId = request.user.user.id;
        const { label, street, city, state, country, zipCode } = request.body;
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
            is_address_set: true,
        });
        return response.status(201).json({
            status: "success",
            message: "Address created successfully",
            data: address,
        });
    }
    catch (error) {
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}
async function updateAddress(request, response) {
    const id = request.query.address_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Address ID is expected" });
    }
    try {
        await Promise.all(addressValidator_1.validateAddress.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { userId, label, street, city, state, country, zipCode } = request.body;
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
    }
    catch (error) {
        console.error("Address update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteAddress(request, response) {
    const id = request.query.address_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Address ID is expected" });
    }
    try {
        const deleteAddress = await AddressService.remove(id);
        return response.status(200).json({ status: "success", message: "Address delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Address update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
