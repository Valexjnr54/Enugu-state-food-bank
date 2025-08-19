// controllers/orderController.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { addOrderNote, allOrder, createTrackingUpdate, deleteOrderNote, getOrderNotes, getTrackingHistory, singleOrder, updateOrderStatus } from "../../services/adminServices/order.service";

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

// Tracking endpoints
export async function addTrackingUpdate(request: Request, response: Response) {
  try {
    const orderId : string = request.query.order_id as string;
    const { status, message, location } = request.body;
    
    // Update main order status first
    await updateOrderStatus(orderId, status);
    
    // Then create tracking update
    const trackingUpdate = await createTrackingUpdate(
      orderId, 
      status, 
      message, 
      location
    );
    
    response.status(201).json(trackingUpdate);
  } catch (error) {
    response.status(500).json({ error: 'Failed to add tracking update' });
  }
}

export async function getOrderTrackingHistory(request: Request, response: Response) {
  try {
    const orderId : string = request.query.order_id as string;
    const history = await getTrackingHistory(orderId);
    response.json(history);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch tracking history' });
  }
}

// Note endpoints
export async function addNote(request: Request, response: Response) {
  try {
    const orderId : string = request.query.order_id as string;
    const { note } = request.body;
    const adminId = request.user?.id; // Assuming you have auth middleware
    
    const orderNote = await addOrderNote(orderId, note, adminId);
    response.status(201).json(orderNote);
  } catch (error) {
    response.status(500).json({ error: 'Failed to add order note' });
  }
}

export async function getNotes(request: Request, response: Response) {
  try {
    const orderId : string = request.query.order_id as string;
    const notes = await getOrderNotes(orderId);
    response.json(notes);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch order notes' });
  }
}

export async function deleteNote(request: Request, response: Response) {
  try {
    const noteId : string = request.query.note_id as string;
    await deleteOrderNote(noteId);
    response.status(204).send();
  } catch (error) {
    response.status(500).json({ error: 'Failed to delete order note' });
  }
}

// Combined order details
// export async function getOrderDetails(req: Request, res: Response) {
//   try {
//     const { orderId } = req.params;
//     const order = await getOrderDetails(orderId);
    
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }
    
//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch order details' });
//   }
// }
