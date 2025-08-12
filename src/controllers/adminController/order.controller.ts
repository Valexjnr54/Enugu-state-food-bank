// controllers/orderController.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { allOrder, singleOrder } from "../../services/adminServices/order.service";

export async function all_order(request: Request, response: Response) {
  try {
      const items = await allOrder();
  
      return response.status(200).json({
        message: items.length ? "Order item(s) fetched" : "No order items found",
        data: items,
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal Server Error" });
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
