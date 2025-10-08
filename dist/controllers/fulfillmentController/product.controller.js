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
exports.getAllProduct = getAllProduct;
exports.getSingleProduct = getSingleProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const models_1 = require("../../models");
const ProductService = __importStar(require("../../services/adminServices/product.service"));
const cloudinary_1 = require("../../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
const express_validator_1 = require("express-validator");
const productValidator_1 = require("../../validators/productValidator");
const slugify_1 = __importDefault(require("slugify"));
const prisma = new models_1.PrismaClient;
async function getAllProduct(request, response) {
    try {
        const allProjects = await ProductService.getAll();
        if (allProjects.length <= 0) {
            return response.status(200).json({ message: 'No Project(s) Found', data: allProjects });
        }
        return response.status(200).json({ message: 'Project(s) fetched', data: allProjects });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleProduct(request, response) {
    const id = request.query.product_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Product ID is expected' });
    }
    try {
        const singleProduct = await ProductService.getOne(id);
        return response.status(200).json({ message: 'Product fetched', data: singleProduct });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function createProduct(request, response) {
    try {
        await Promise.all(productValidator_1.validateProduct.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { name, description, brand, basePrice, currency, isPerishable, shelfLifeDays, unit, packageType, active, categoryId, } = request.body;
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        const files = request.files;
        let productImageUrl;
        let imageUrls = [];
        // Upload single product_image
        if (files["product_image"]?.[0]) {
            const filePath = files["product_image"][0].path;
            productImageUrl = await (0, cloudinary_1.uploadImage)(filePath, "products");
            // Optional: remove local file
            fs_1.default.unlink(filePath, () => { });
        }
        // Upload multiple image
        if (files["image"]) {
            for (const file of files["image"]) {
                const imagePath = file.path;
                const url = await (0, cloudinary_1.uploadImage)(imagePath, "products/gallery");
                fs_1.default.unlink(imagePath, () => { }); // Cleanup regardless
                if (!url) {
                    throw new Error("Failed to upload image to Cloudinary.");
                }
                imageUrls.push(url); // ✅ Now guaranteed to be string
            }
        }
        const product = await ProductService.create({
            name,
            description,
            slug,
            brand,
            basePrice: parseFloat(basePrice),
            currency: currency || "NGN",
            isPerishable: isPerishable === "true" || isPerishable === true,
            shelfLifeDays: shelfLifeDays ? parseInt(shelfLifeDays) : undefined,
            unit,
            packageType,
            active: active === "true" || active === true,
            categoryId,
            product_image: productImageUrl,
            image: imageUrls,
        });
        return response.status(201).json({
            status: "success",
            message: "Product created successfully",
            data: product,
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
async function updateProduct(request, response) {
    const id = request.query.product_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Product ID is expected" });
    }
    try {
        await Promise.all(productValidator_1.validateProduct.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { name, description, brand, basePrice, currency, isPerishable, shelfLifeDays, unit, packageType, active, categoryId, } = request.body;
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        const files = request.files;
        const existingProduct = await ProductService.getOne(id);
        if (!existingProduct) {
            return response.status(404).json({ status: "error", message: "Product not found" });
        }
        // 🔒 Safely get existing image
        const existingImageUrls = Array.isArray(existingProduct.image)
            ? existingProduct.image.filter((item) => typeof item === "string")
            : [];
        let productImageUrl = existingProduct.product_image;
        let imageUrls = existingImageUrls;
        // ✅ Handle product image update
        if (files?.product_image?.[0]) {
            const filePath = files.product_image[0].path;
            const newUrl = await (0, cloudinary_1.uploadImage)(filePath, "products");
            fs_1.default.unlink(filePath, () => { });
            if (newUrl && newUrl !== existingProduct.product_image) {
                if (existingProduct.product_image) {
                    await (0, cloudinary_1.deleteImageFromCloudinary)(existingProduct.product_image);
                }
                productImageUrl = newUrl;
            }
        }
        // ✅ Handle gallery image update
        if (files?.image?.length > 0) {
            const newUrls = [];
            for (const file of files.image) {
                const imagePath = file.path;
                const url = await (0, cloudinary_1.uploadImage)(imagePath, "products/gallery");
                fs_1.default.unlink(imagePath, () => { });
                if (!url)
                    throw new Error("Failed to upload image to Cloudinary.");
                newUrls.push(url);
            }
            // Compare image sets
            const areDifferent = newUrls.length !== existingImageUrls.length ||
                newUrls.some((url) => !existingImageUrls.includes(url));
            if (areDifferent) {
                for (const img of existingImageUrls) {
                    await (0, cloudinary_1.deleteImageFromCloudinary)(img);
                }
                imageUrls = newUrls;
            }
        }
        const updatedProduct = await ProductService.update(id, {
            name,
            slug,
            description,
            brand,
            basePrice: parseFloat(basePrice),
            currency: currency || "NGN",
            isPerishable: isPerishable === "true" || isPerishable === true,
            shelfLifeDays: shelfLifeDays ? parseInt(shelfLifeDays) : undefined,
            unit,
            packageType,
            active: active === "true" || active === true,
            categoryId,
            product_image: productImageUrl,
            image: imageUrls,
        });
        return response.status(200).json({ status: "success", message: "Product updated successfully", data: updatedProduct, });
    }
    catch (error) {
        console.error("Product update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteProduct(request, response) {
    const id = request.query.product_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Product ID is expected" });
    }
    try {
        const deleteProduct = await ProductService.remove(id);
        return response.status(200).json({ status: "success", message: "Product delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Product update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
