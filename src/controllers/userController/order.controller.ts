// controllers/orderController.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { allOrderByUser, createOrder, singleOrderByUser } from "../../services/userServices/order.service";

export async function create_order(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ status: "error", errors: errors.array() });
  }

  const userId = request.user.user.id;
  const { addressId } = request.body;

  try {
    const order = await createOrder(userId, addressId);
    return response.status(201).json({ status: "success", message: "Order placed", data: order });
  } catch (error: any) {
    return response.status(400).json({ status: "error", message: error.message });
  }
}

export async function all_order(request: Request, response: Response) {
  try {
      const userId = request.user.user.id;
      const items = await allOrderByUser(userId);
  
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
  const userId = request.user.user.id
  
  if (!id) {
    return response.status(400).json({status:"error", message: 'Order ID is expected' }); 
  }
  
  try {
    const singleOrder = await singleOrderByUser(userId, id)
    return response.status(200).json({message: 'Order fetched', data: singleOrder });
  } catch (error: any) {
    const status = error.statusCode || 500;
    response.status(status).json({
      status: "error",
      message: error.message || "Unexpected error",
    });
  }
}
