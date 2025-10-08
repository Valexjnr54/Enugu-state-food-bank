"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allOrder = allOrder;
exports.singleOrder = singleOrder;
exports.createTrackingUpdate = createTrackingUpdate;
exports.getTrackingHistory = getTrackingHistory;
exports.addOrderNote = addOrderNote;
exports.getOrderNotes = getOrderNotes;
exports.deleteOrderNote = deleteOrderNote;
exports.updateOrderStatus = updateOrderStatus;
// services/orderService.ts
const models_1 = require("../../models");
const handlePrismaErrors_1 = require("../../utils/handlePrismaErrors");
const enums_1 = require("../../types/enums");
const prisma = new models_1.PrismaClient();
async function allOrder() {
    return prisma.order.findMany({
    // include: { items: { include: {Product: true, variant: true} } },
    });
}
async function singleOrder(orderId) {
    try {
        return prisma.order.findFirst({
            where: { id: orderId },
            include: { items: { include: { Product: true, variant: true } } },
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
// Order Tracking functions
async function createTrackingUpdate(orderId, status, message, location) {
    try {
        // Update main order status first
        const updateData = { orderStatus: status };
        if (status === enums_1.OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        else if (status === enums_1.OrderStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
        }
        await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
        // Then create tracking update
        return await prisma.orderTracking.create({
            data: {
                orderId,
                status,
                message,
                location
            }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
async function getTrackingHistory(orderId) {
    try {
        return await prisma.orderTracking.findMany({
            where: { orderId },
            orderBy: { updatedAt: 'desc' }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
// Order Note functions
async function addOrderNote(orderId, note, adminId) {
    try {
        return await prisma.orderNote.create({
            data: {
                orderId,
                note,
                adminId
            }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
async function getOrderNotes(orderId) {
    try {
        return await prisma.orderNote.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
            include: { admin: true }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
async function deleteOrderNote(noteId) {
    try {
        return await prisma.orderNote.delete({
            where: { id: noteId }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
// Additional utility functions
async function updateOrderStatus(orderId, status) {
    try {
        const updateData = { orderStatus: status };
        if (status === enums_1.OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        else if (status === enums_1.OrderStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
        }
        return await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
