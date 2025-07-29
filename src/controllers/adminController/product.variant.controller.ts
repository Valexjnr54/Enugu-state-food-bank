import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as ProductVariantService from '../../services/adminServices/product.variant.service';
import { validationResult } from "express-validator";
import { validateProductVariant } from "../../validators/productVariantValidator";
import slugify from "slugify";
import { deleteImageFromCloudinary, uploadImage } from "../../utils/cloudinary";
import fs from "fs";

const prisma = new PrismaClient;

export async function getAllProductVariant(request: Request, response: Response) {
    try {
        const allCategories = await ProductVariantService.getAll()
        if(allCategories.length <= 0){
            return response.status(200).json({ message: 'No Product Variant(s) Found', data:allCategories });
        }
        return response.status(200).json({message: 'Product Variant(s) fetched', data: allCategories });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleProductVariant(request: Request, response: Response) {
    const id: string = request.query.product_variant_id as string;

    if (!id) {
       return response.status(400).json({status:"error", message: 'Product Variant ID is expected' }); 
    }
    
    try {
        const singleProductVariant = await ProductVariantService.getOne(id)
        return response.status(200).json({message: 'Product Variant fetched', data: singleProductVariant });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function createProductVariant(request: Request, response: Response) {
    try {
        // Parse attributes if sent as a string
        if (typeof request.body.attributes === 'string') {
            try {
                request.body.attributes = JSON.parse(request.body.attributes);
            } catch (err) {
                return response.status(400).json({
                    errors: [{ msg: "Invalid attributes JSON format" }]
                });
            }
        }
        await Promise.all(validateProductVariant.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            sku,
            name,
            netWeight,
            price,
            attributes,
            expiryDate,
            productId
        } = request.body;

        const files = request.files as {
            [   fieldname: string]: Express.Multer.File[];
        };

        let imageUrl: string | undefined;

        // Upload single product_image
        if (files["image"]?.[0]) {
            const filePath = files["image"][0].path;
            imageUrl = await uploadImage(filePath, "product_variant");

            // Optional: remove local file
            fs.unlink(filePath, () => {});
        }

        const product_variant = await ProductVariantService.create({
            sku,
            name,
            netWeight: netWeight ? parseFloat(netWeight) : null,
            price: parseFloat(price),
            attributes,
            expiryDate,
            productId,
            image: imageUrl,
        });

        return response.status(201).json({
            status: "success",
            message: "Product Variant created successfully",
            data: product_variant,
        });

    } catch (error: any) {

        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}

export async function updateProductVariant(request: Request, response: Response) {
    const id: string = request.query.product_variant_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Product Variant ID is expected" });
    }

    try {
        // Parse attributes if sent as a string
        if (typeof request.body.attributes === 'string') {
            try {
                request.body.attributes = JSON.parse(request.body.attributes);
            } catch (err) {
                return response.status(400).json({
                    errors: [{ msg: "Invalid attributes JSON format" }]
                });
            }
        }
        await Promise.all(validateProductVariant.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            sku,
            name,
            netWeight,
            price,
            attributes,
            expiryDate,
            productId
        } = request.body;

        const files = request.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const existingProduct = await ProductVariantService.getOne(id);
        if (!existingProduct) {
            return response.status(404).json({ status: "error", message: "Product Variant not found" });
        }

        let productVariantImageUrl = existingProduct.image;

        // ✅ Handle product image update
        if (files?.image?.[0]) {
            const filePath = files.image[0].path;
            const newUrl = await uploadImage(filePath, "products_variant");
            fs.unlink(filePath, () => {});

            if (newUrl && newUrl !== existingProduct.image) {
                if (existingProduct.image) {
                    await deleteImageFromCloudinary(existingProduct.image);
                }
                productVariantImageUrl = newUrl;
            }
        }

        const updatedProductVariant = await ProductVariantService.update(id, {
            sku,
            name,
            netWeight: netWeight ? parseFloat(netWeight) : null,
            price: parseFloat(price),
            attributes,
            expiryDate,
            productId,
            image: productVariantImageUrl,
        });

        return response.status(200).json({ status: "success", message: "Product Variant updated successfully", data: updatedProductVariant, });

    } catch (error: any) {
        console.error("Product Variant update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteProductVariant(request: Request, response: Response) {
    const id: string = request.query.product_variant_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Product Variant ID is expected" });
    }

    try {
        const deleteProductVariant = await ProductVariantService.remove(id);

        return response.status(200).json({ status: "success", message: "Product Variant delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Product Variant update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}