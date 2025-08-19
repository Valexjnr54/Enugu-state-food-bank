// services/orderService.ts
import { PrismaClient } from "../../models";
import { handlePrismaError } from "../../utils/handlePrismaErrors";
import { OrderStatus } from "../../types/enums";

const prisma = new PrismaClient();

export async function allOrder() {
  return prisma.order.findMany({
    // include: { items: { include: {Product: true, variant: true} } },
  });
}

export async function singleOrder(orderId: string) {
  try {
    return prisma.order.findFirst({
      where: { id:orderId },
      include: { items: { include: {Product: true, variant: true} } },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Order Tracking functions
export async function createTrackingUpdate(orderId: string, status: OrderStatus, message?: string, location?: string) {
  try {
    // Update main order status first
    const updateData: any = { orderStatus: status };
    
    if (status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
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
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function getTrackingHistory(orderId: string) {
  try {
    return await prisma.orderTracking.findMany({
      where: { orderId },
      orderBy: { updatedAt: 'desc' }
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Order Note functions
export async function addOrderNote(orderId: string, note: string, adminId?: number) {
  try {
    return await prisma.orderNote.create({
      data: {
        orderId,
        note,
        adminId
      }
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function getOrderNotes(orderId: string) {
  try {
    return await prisma.orderNote.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: { admin: true }
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteOrderNote(noteId: string) {
  try {
    return await prisma.orderNote.delete({
      where: { id: noteId }
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Additional utility functions
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const updateData: any = { orderStatus: status };
    
    if (status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
