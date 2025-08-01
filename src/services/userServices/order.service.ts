// services/orderService.ts
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { PrismaClient } from "../../models";
import { handlePrismaError } from "../../utils/handlePrismaErrors";

const prisma = new PrismaClient();

export async function createOrder(userId: string, addressId: string) {
  // 1. Verify user and address
  const user = await prisma.user.findUnique({
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
    include: { items: { include: {variant: true, Product: true}}, trackingUpdates: true }
  });

  // 4. Clear cart
  await prisma.cartItem.deleteMany({ where: { userId } });

  return order;
}
