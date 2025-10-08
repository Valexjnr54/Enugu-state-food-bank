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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductVariant = getAllProductVariant;
exports.getSingleProductVariant = getSingleProductVariant;
exports.createProductVariant = createProductVariant;
exports.updateProductVariant = updateProductVariant;
exports.deleteProductVariant = deleteProductVariant;
const models_1 = require("../../models");
const ProductVariantService = __importStar(require("../../services/adminServices/product.variant.service"));
const express_validator_1 = require("express-validator");
const productVariantValidator_1 = require("../../validators/productVariantValidator");
const cloudinary_1 = require("../../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
const prisma = new models_1.PrismaClient;
async function getAllProductVariant(request, response) {
    try {
        const allCategories = await ProductVariantService.getAll();
        if (allCategories.length <= 0) {
            return response.status(200).json({ message: 'No Product Variant(s) Found', data: allCategories });
        }
        return response.status(200).json({ message: 'Product Variant(s) fetched', data: allCategories });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleProductVariant(request, response) {
    const id = request.query.product_variant_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Product Variant ID is expected' });
    }
    try {
        const singleProductVariant = await ProductVariantService.getOne(id);
        return response.status(200).json({ message: 'Product Variant fetched', data: singleProductVariant });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function createProductVariant(request, response) {
    try {
        // Parse attribute if sent as a string
        if (typeof request.body.attribute === 'string') {
            try {
                request.body.attribute = JSON.parse(request.body.attribute);
            }
            catch (err) {
                return response.status(400).json({
                    errors: [{ msg: "Invalid attribute JSON format" }]
                });
            }
        }
        await Promise.all(productVariantValidator_1.validateProductVariant.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { sku, name, netWeight, price, attribute, expiryDate, productId } = request.body;
        const files = request.files;
        let imageUrl;
        // Upload single product_image
        if (files["image"]?.[0]) {
            const filePath = files["image"][0].path;
            imageUrl = await (0, cloudinary_1.uploadImage)(filePath, "product_variant");
            // Optional: remove local file
            fs_1.default.unlink(filePath, () => { });
        }
        const product_variant = await ProductVariantService.create({
            sku,
            name,
            netWeight: netWeight ? parseFloat(netWeight) : null,
            price: parseFloat(price),
            attribute,
            expiryDate,
            productId,
            image: imageUrl,
        });
        return response.status(201).json({
            status: "success",
            message: "Product Variant created successfully",
            data: product_variant,
        });
    }
    catch (error) {
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}
async function updateProductVariant(request, response) {
    const id = request.query.product_variant_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Product Variant ID is expected" });
    }
    try {
        // Parse attribute if sent as a string
        if (typeof request.body.attribute === 'string') {
            try {
                request.body.attribute = JSON.parse(request.body.attribute);
            }
            catch (err) {
                return response.status(400).json({
                    errors: [{ msg: "Invalid attribute JSON format" }]
                });
            }
        }
        await Promise.all(productVariantValidator_1.validateProductVariant.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { sku, name, netWeight, price, attribute, expiryDate, productId } = request.body;
        const files = request.files;
        const existingProduct = await ProductVariantService.getOne(id);
        if (!existingProduct) {
            return response.status(404).json({ status: "error", message: "Product Variant not found" });
        }
        let productVariantImageUrl = existingProduct.image;
        // ✅ Handle product image update
        if (files?.image?.[0]) {
            const filePath = files.image[0].path;
            const newUrl = await (0, cloudinary_1.uploadImage)(filePath, "products_variant");
            fs_1.default.unlink(filePath, () => { });
            if (newUrl && newUrl !== existingProduct.image) {
                if (existingProduct.image) {
                    await (0, cloudinary_1.deleteImageFromCloudinary)(existingProduct.image);
                }
                productVariantImageUrl = newUrl;
            }
        }
        const updatedProductVariant = await ProductVariantService.update(id, {
            sku,
            name,
            netWeight: netWeight ? parseFloat(netWeight) : null,
            price: parseFloat(price),
            attribute,
            expiryDate,
            productId,
            image: productVariantImageUrl,
        });
        return response.status(200).json({ status: "success", message: "Product Variant updated successfully", data: updatedProductVariant, });
    }
    catch (error) {
        console.error("Product Variant update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteProductVariant(request, response) {
    const id = request.query.product_variant_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Product Variant ID is expected" });
    }
    try {
        const deleteProductVariant = await ProductVariantService.remove(id);
        return response.status(200).json({ status: "success", message: "Product Variant delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Product Variant update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
