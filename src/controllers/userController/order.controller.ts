// controllers/orderController.ts
import { Request, response, Response } from "express";
import { validationResult } from "express-validator";
import { createOrder } from "../../services/userServices/order.service";

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
