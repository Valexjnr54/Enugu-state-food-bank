import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as ProductService from '../../services/adminServices/product.service';
import { singleOrder, singleOrderByUser } from "../../services/userServices/order.service";
import { generateOtp, verifyOrderStoredOtp } from "../../utils/otpHandler";
import { sendSMS } from "../../utils/sendSMS";
import QRCode from 'qrcode';

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

export async function single_order(request: Request, response: Response) {
  const id: string = request.query.order_id as string;
  
  if (!id) {
    return response.status(400).json({status:"error", message: 'Order ID is expected' }); 
  }
  
  try {
    const single_order = await singleOrder(id)
    return response.status(200).json({message: 'Order fetched', data: single_order });
  } catch (error: any) {
    const status = error.statusCode || 500;
    response.status(status).json({
      status: "error",
      message: error.message || "Unexpected error",
    });
  }
}

export async function confirm_user(request: Request, response: Response) {
    const { identifier, order_id } = request.body;

    if (!identifier) {
        return response.status(400).json({
            error: 'Missing identifier',
            message: 'You must provide an identifier (email, phone, or employee_id)',
        });
    }

    if (!order_id) {
        return response.status(400).json({status:"error", message: 'Order ID is expected' }); 
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { employee_id: identifier },
                    {verification_id: identifier},
                    { phone: identifier }
                ],
            },
        });

        if (!user) {
            return response.status(404).json({
                error: 'User Not Found',
                message: 'No user found with provided identifier'
            });
        }

        const user_id = user.id;

        const order = await singleOrderByUser(user_id, order_id);
        if (!order) {
            return response.status(400).json({status:"error", message: 'Order from this user could not be found/ Order does not belong to this user' }); 
        }

        const otp = await generateOtp();

        const updated_order= await prisma.order.update({ where: { id: order_id, userId: user_id }, data:{ order_confirmation_otp:  parseInt(otp, 10) }});
        const message = `Your Food Bank one-time password (OTP) is: ${otp}. Please provide this code to the dispatch rider upon delivery to confirm your order. The code expires in 10 minutes. Do not share it with anyone else.`;
        await sendSMS(order.user.phone, message);

        return response.status(200).json({message: 'Order User Confirmed', nextStep: 'confirm_order', data: updated_order });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function confirm_delivery_order(request: Request, response: Response) {
    const { user_id, order_id, otp } = request.body;

    if (!user_id) {
        return response.status(400).json({status:"error", message: 'User ID is expected' }); 
    }

    if (!order_id) {
        return response.status(400).json({status:"error", message: 'Order ID is expected' }); 
    }

    if (!otp) {
        return response.status(400).json({status:"error", message: 'One-Time Password(OTP) is expected' }); 
    }

    try {
        const isValid = await verifyOrderStoredOtp(user_id ,order_id, otp);
        
        if (!isValid) {
            return response.status(401).json({
                error: 'Invalid OTP',
                message: 'The OTP provided is incorrect or has expired'
            });
        }

        const order = await prisma.order.update({ where:{id: order_id, userId: user_id}, data:{ orderStatus: "DELIVERED", deliveredAt: new Date() } });
        return response.status(200).json({message: 'Order has been delivered', data: order });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function generateQr(request: Request, response: Response): Promise<void> {
    const id: string = request.query.order_id as string;

  try {
    const single_order = await singleOrder(id)
    /* 3. render PNG ------------------------------------------------- */
    const url = `https://enugu-state-food-bank.onrender.com/api/v1/generate-qr-code?order_id=${id}`
    const pngBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 300,
      margin: 2,
      color: { dark: '#000', light: '#FFF' },
    });

    /* 4. return image ----------------------------------------------- */
    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Content-Disposition', `inline; filename="qr-${single_order}.png"`);
    response.send(pngBuffer);
  } catch (error: any) {
    /* duplicate payload → return existing QR */
    if (error.code === 'P2002') {
      const existing = await singleOrder(id)
      const url = `https://enugu-state-food-bank.onrender.com/api/v1/generate-qr-code?order_id=${id}`
      const png = await QRCode.toBuffer(url, { type: 'png', width: 300 });
      response.setHeader('Content-Type', 'image/png');
      response.send(png);
    }
    response.status(500).json({ error: 'QR generation failed' });
  }
}