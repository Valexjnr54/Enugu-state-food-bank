import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as CategoryService from '../../services/adminServices/category.service';
import { validationResult } from "express-validator";
import { validateCategory } from "../../validators/categoryValidator";
import slugify from "slugify";

const prisma = new PrismaClient;

export async function getAllCategory(request: Request, response: Response) {
    try {
        const allCategories = await CategoryService.getAll()
        if(allCategories.length <= 0){
            return response.status(200).json({ message: 'No Category(s) Found', data:allCategories });
        }
        return response.status(200).json({message: 'Category(s) fetched', data: allCategories });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleCategory(request: Request, response: Response) {
    const id: string = request.query.category_id as string;

    if (!id) {
       return response.status(400).json({status:"error", message: 'Category ID is expected' }); 
    }
    
    try {
        const singleCategory = await CategoryService.getOne(id)
        return response.status(200).json({message: 'Category fetched', data: singleCategory });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function createCategory(request: Request, response: Response) {
    try {
        await Promise.all(validateCategory.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            parentId,
        } = request.body;

        const slug = slugify(name, { lower: true, strict: true });

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

export async function updateCategory(request: Request, response: Response) {
    const id: string = request.query.category_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Category ID is expected" });
    }

    try {
        await Promise.all(validateCategory.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            parentId,
        } = request.body;

        const slug = slugify(name, { lower: true, strict: true });

        const updatedCategory = await CategoryService.update(id, {
            name,
            slug,
            parentId,
        });

        return response.status(200).json({ status: "success", message: "Category updated successfully", data: updatedCategory, });

    } catch (error: any) {
        console.error("Category update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteCategory(request: Request, response: Response) {
    const id: string = request.query.category_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Category ID is expected" });
    }

    try {
        const deleteCategory = await CategoryService.remove(id);

        return response.status(200).json({ status: "success", message: "Category delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Category update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}