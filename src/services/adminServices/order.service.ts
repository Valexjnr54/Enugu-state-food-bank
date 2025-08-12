// services/orderService.ts
import { PrismaClient } from "../../models";
import { handlePrismaError } from "../../utils/handlePrismaErrors";

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
