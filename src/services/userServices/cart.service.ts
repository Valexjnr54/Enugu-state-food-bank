import { PrismaClient } from "../../models";
import { handlePrismaError } from "../../utils/handlePrismaErrors";

const prisma = new PrismaClient();

export async function getAllByUser(userId: string){
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: true, variant: true },
  });
};

export async function createOrUpdate({ userId, productId, variantId, quantity, }: { userId: string; productId?: string; variantId?: string; quantity: number; }){
  try {
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: productId ?? undefined,
        variantId: variantId ?? undefined,
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity, updatedAt: new Date() },
        include: { product: true, variant: true },
      });
    }

    return prisma.cartItem.create({
      data: {
        userId,
        productId: productId ?? undefined,
        variantId: variantId ?? undefined,
        quantity,
      },
      include: { product: true, variant: true },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export async function update ( cartItemId: string, data: { quantity: number } ) {
  try {
    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: data.quantity,
        updatedAt: new Date(),
      },
      include: {
        product: true,
        variant: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export async function remove (id: string){
  try {
    return prisma.cartItem.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

export async function clearCart(userId: string){
  const items = await prisma.cartItem.findMany({ where: { userId } });
  const deletions = items.map((item) => prisma.cartItem.delete({ where: { id: item.id } }));
  await Promise.all(deletions);
  return true;
};
