import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as ProductService from '../../services/adminServices/product.service';
import { deleteImageFromCloudinary, uploadImage } from "../../utils/cloudinary";
import fs from "fs";
import { validationResult } from "express-validator";
import { validateProduct } from "../../validators/productValidator";
import slugify from "slugify";

const prisma = new PrismaClient;

export async function getAllProduct(request: Request, response: Response) {
    try {
        const allProjects = await ProductService.getAll()
        if(allProjects.length <= 0){
            return response.status(200).json({ message: 'No Project(s) Found', data:allProjects });
        }
        return response.status(200).json({message: 'Project(s) fetched', data: allProjects });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleProduct(request: Request, response: Response) {
    const id: string = request.query.product_id as string;

    if (!id) {
       return response.status(400).json({status:"error", message: 'Product ID is expected' }); 
    }
    
    try {
        const singleProduct = await ProductService.getOne(id)
        return response.status(200).json({message: 'Product fetched', data: singleProduct });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function createProduct(request: Request, response: Response) {
    try {
        await Promise.all(validateProduct.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
        name,
        description,
        brand,
        basePrice,
        currency,
        isPerishable,
        shelfLifeDays,
        unit,
        packageType,
        active,
        categoryId,
        } = request.body;

        const slug = slugify(name, { lower: true, strict: true });

        const files = request.files as {
        [   fieldname: string]: Express.Multer.File[];
        };

        let productImageUrl: string | undefined;
        let imageUrls: string[] = [];

        // Upload single product_image
        if (files["product_image"]?.[0]) {
            const filePath = files["product_image"][0].path;
            productImageUrl = await uploadImage(filePath, "products");

            // Optional: remove local file
            fs.unlink(filePath, () => {});
        }

        // Upload multiple image
        if (files["image"]) {
            for (const file of files["image"]) {
                const imagePath = file.path;
                const url = await uploadImage(imagePath, "products/gallery");

                fs.unlink(imagePath, () => {}); // Cleanup regardless

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

export async function updateProduct(request: Request, response: Response) {
    const id: string = request.query.product_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Product ID is expected" });
    }

    try {
        await Promise.all(validateProduct.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            description,
            brand,
            basePrice,
            currency,
            isPerishable,
            shelfLifeDays,
            unit,
            packageType,
            active,
            categoryId,
        } = request.body;

        const slug = slugify(name, { lower: true, strict: true });

        const files = request.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const existingProduct = await ProductService.getOne(id);
        if (!existingProduct) {
            return response.status(404).json({ status: "error", message: "Product not found" });
        }

        // 🔒 Safely get existing image
        const existingImageUrls: string[] = Array.isArray(existingProduct.image)
        ? existingProduct.image.filter((item): item is string => typeof item === "string")
        : [];

        let productImageUrl = existingProduct.product_image;
        let imageUrls: string[] = existingImageUrls;

        // ✅ Handle product image update
        if (files?.product_image?.[0]) {
            const filePath = files.product_image[0].path;
            const newUrl = await uploadImage(filePath, "products");
            fs.unlink(filePath, () => {});

            if (newUrl && newUrl !== existingProduct.product_image) {
                if (existingProduct.product_image) {
                    await deleteImageFromCloudinary(existingProduct.product_image);
                }
                productImageUrl = newUrl;
            }
        }

        // ✅ Handle gallery image update
        if (files?.image?.length > 0) {
            const newUrls: string[] = [];

            for (const file of files.image) {
                const imagePath = file.path;
                const url = await uploadImage(imagePath, "products/gallery");
                fs.unlink(imagePath, () => {});

                if (!url) throw new Error("Failed to upload image to Cloudinary.");
                newUrls.push(url);
            }

            // Compare image sets
            const areDifferent =
                newUrls.length !== existingImageUrls.length ||
                newUrls.some((url) => !existingImageUrls.includes(url));

            if (areDifferent) {
                for (const img of existingImageUrls) {
                    await deleteImageFromCloudinary(img);
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

    } catch (error: any) {
        console.error("Product update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteProduct(request: Request, response: Response) {
    const id: string = request.query.product_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "Product ID is expected" });
    }

    try {
        const deleteProduct = await ProductService.remove(id);

        return response.status(200).json({ status: "success", message: "Product delete successfully", data: {}, });
    } catch (error: any) {
        console.error("Product update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}