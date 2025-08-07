import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as ProductService from '../../services/adminServices/product.service';

const prisma = new PrismaClient;

export async function allProduct(request: Request, response: Response) {
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

export async function singleProduct(request: Request, response: Response) {
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
