"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_order = create_order;
exports.all_order = all_order;
exports.single_order = single_order;
const express_validator_1 = require("express-validator");
const order_service_1 = require("../../services/userServices/order.service");
async function create_order(request, response) {
    const errors = (0, express_validator_1.validationResult)(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ status: "error", errors: errors.array() });
    }
    const userId = request.user.user.id;
    const { addressId } = request.body;
    try {
        const order = await (0, order_service_1.createOrder)(userId, addressId);
        return response.status(201).json({ status: "success", message: "Order placed", data: order });
    }
    catch (error) {
        return response.status(400).json({ status: "error", message: error.message });
    }
}
async function all_order(request, response) {
    try {
        const userId = request.user.user.id;
        const items = await (0, order_service_1.allOrderByUser)(userId);
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
    const userId = request.user.user.id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Order ID is expected' });
    }
    try {
        const singleOrder = await (0, order_service_1.singleOrderByUser)(userId, id);
        return response.status(200).json({ message: 'Order fetched', data: singleOrder });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
