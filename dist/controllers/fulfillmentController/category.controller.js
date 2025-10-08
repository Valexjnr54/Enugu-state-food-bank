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
exports.getAllCategory = getAllCategory;
exports.getSingleCategory = getSingleCategory;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const models_1 = require("../../models");
const CategoryService = __importStar(require("../../services/adminServices/category.service"));
const express_validator_1 = require("express-validator");
const categoryValidator_1 = require("../../validators/categoryValidator");
const slugify_1 = __importDefault(require("slugify"));
const prisma = new models_1.PrismaClient;
async function getAllCategory(request, response) {
    try {
        const allCategories = await CategoryService.getAll();
        if (allCategories.length <= 0) {
            return response.status(200).json({ message: 'No Category(s) Found', data: allCategories });
        }
        return response.status(200).json({ message: 'Category(s) fetched', data: allCategories });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function getSingleCategory(request, response) {
    const id = request.query.category_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Category ID is expected' });
    }
    try {
        const singleCategory = await CategoryService.getOne(id);
        return response.status(200).json({ message: 'Category fetched', data: singleCategory });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function createCategory(request, response) {
    try {
        await Promise.all(categoryValidator_1.validateCategory.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { name, parentId, } = request.body;
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        const category = await CategoryService.create({
            name,
            slug,
            parentId,
        });
        return response.status(201).json({
            status: "success",
            message: "Category created successfully",
            data: category,
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
async function updateCategory(request, response) {
    const id = request.query.category_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Category ID is expected" });
    }
    try {
        await Promise.all(categoryValidator_1.validateCategory.map((rule) => rule.run(request)));
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { name, parentId, } = request.body;
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        const updatedCategory = await CategoryService.update(id, {
            name,
            slug,
            parentId,
        });
        return response.status(200).json({ status: "success", message: "Category updated successfully", data: updatedCategory, });
    }
    catch (error) {
        console.error("Category update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
async function deleteCategory(request, response) {
    const id = request.query.category_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: "Category ID is expected" });
    }
    try {
        const deleteCategory = await CategoryService.remove(id);
        return response.status(200).json({ status: "success", message: "Category delete successfully", data: {}, });
    }
    catch (error) {
        console.error("Category update error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
