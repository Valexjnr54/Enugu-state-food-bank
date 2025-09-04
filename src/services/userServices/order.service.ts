// services/orderService.ts
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { PrismaClient } from "../../models";
import { handlePrismaError } from "../../utils/handlePrismaErrors";

const prisma = new PrismaClient();

export async function createOrder(userId: string, addressId: string) {
  // 1. Verify user and address
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { cart_items: { include: { product: true, variant: true } }, addresses: true }
  });

  if (!user) throw new NotFoundError("User not found");
  if (!user.is_address_set) throw new BadRequestError("Please set your address first");

  const addressExists = user.addresses.some(addr => addr.id === addressId);
  if (!addressExists) throw new BadRequestError("Invalid address");

  const cartItems = user.cart_items;
  if (cartItems.length === 0) throw new BadRequestError("Your cart is empty");

  // 2. Prepare OrderItems
  const orderItems = cartItems.map((item) => {
    const price = item.variant ? item.variant.price : item.product?.basePrice;
    if (!price) throw new BadRequestError("Price info missing");

    return {
      variantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: price,
      currency: "NGN",
      total: price * item.quantity
    };
  });

  const totalAmount = orderItems.reduce((sum, i) => sum + i.total, 0);

  // 3. Create Order + Items + Tracking
  const order = await prisma.order.create({
    data: {
      userId,
      addressId,
      totalAmount,
      currency: "NGN",
      items: { create: orderItems },
      trackingUpdates: {
        create: {
          status: "PENDING",
          updatedAt: new Date()
        }
      }
    },
    include: { user: true, items: { include: {variant: true, Product: true}}, trackingUpdates: true }
  });

  const update_loan_amount = user.loan_amount_collected + totalAmount;
  const update_loan_unit = user.loan_unit - totalAmount;

  await prisma.user.update({
    where: {id : userId},
    data:{
      loan_amount_collected: update_loan_amount,
      loan_unit: update_loan_unit
    }
  })

  // 4. Clear cart
  await prisma.cartItem.deleteMany({ where: { userId } });

  return order;
}

export async function allOrderByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { user: true, items: { include: {Product: true} } },
  });
}

export async function singleOrderByUser(userId: string, orderId: string) {
  try {
    return prisma.order.findFirst({
      where: { id:orderId, userId },
      include: { user: true, items: { include: {Product: true} } },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function singleOrder(orderId: string) {
  try {
    return prisma.order.findFirst({
      where: { id:orderId },
      include: { user: true, items: { include: {Product: true} } },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}