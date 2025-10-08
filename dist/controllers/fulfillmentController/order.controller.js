"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.all_order = all_order;
exports.single_order = single_order;
exports.addTrackingUpdate = addTrackingUpdate;
exports.getOrderTrackingHistory = getOrderTrackingHistory;
exports.addNote = addNote;
exports.getNotes = getNotes;
exports.deleteNote = deleteNote;
const order_service_1 = require("../../services/adminServices/order.service");
async function all_order(request, response) {
    try {
        const items = await (0, order_service_1.allOrder)();
        return response.status(200).json({
            message: items.length ? "Order item(s) fetched" : "No order items found",
            data: items,
        });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal Server Error" });
    }
}
async function single_order(request, response) {
    const id = request.query.order_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Order ID is expected' });
    }
    try {
        const single_order = await (0, order_service_1.singleOrder)(id);
        return response.status(200).json({ message: 'Order fetched', data: single_order });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
// Tracking endpoints
async function addTrackingUpdate(request, response) {
    try {
        const orderId = request.query.order_id;
        const { status, message, location } = request.body;
        // Update main order status first
        await (0, order_service_1.updateOrderStatus)(orderId, status);
        // Then create tracking update
        const trackingUpdate = await (0, order_service_1.createTrackingUpdate)(orderId, status, message, location);
        response.status(201).json(trackingUpdate);
    }
    catch (error) {
        response.status(500).json({ error: 'Failed to add tracking update' });
    }
}
async function getOrderTrackingHistory(request, response) {
    try {
        const orderId = request.query.order_id;
        const history = await (0, order_service_1.getTrackingHistory)(orderId);
        response.json(history);
    }
    catch (error) {
        response.status(500).json({ error: 'Failed to fetch tracking history' });
    }
}
// Note endpoints
async function addNote(request, response) {
    try {
        const orderId = request.query.order_id;
        const { note } = request.body;
        const adminId = request.user?.id; // Assuming you have auth middleware
        const orderNote = await (0, order_service_1.addOrderNote)(orderId, note, adminId);
        response.status(201).json(orderNote);
    }
    catch (error) {
        response.status(500).json({ error: 'Failed to add order note' });
    }
}
async function getNotes(request, response) {
    try {
        const orderId = request.query.order_id;
        const notes = await (0, order_service_1.getOrderNotes)(orderId);
        response.json(notes);
    }
    catch (error) {
        response.status(500).json({ error: 'Failed to fetch order notes' });
    }
}
async function deleteNote(request, response) {
    try {
        const noteId = request.query.note_id;
        await (0, order_service_1.deleteOrderNote)(noteId);
        response.status(204).send();
    }
    catch (error) {
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
