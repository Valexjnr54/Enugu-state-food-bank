import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as CartService from "../../services/userServices/cart.service";

const prisma = new PrismaClient();

// Utility: Validate product or variant (not both or none)
function validateProductOrVariant(productId?: string, variantId?: string) {
  if (!productId && !variantId) {
    throw new Error("Either productId or variantId must be provided.");
  }
  if (productId && variantId) {
    throw new Error("Only one of productId or variantId should be provided.");
  }
}

// POST /cart
export async function addToCart(request: Request, response: Response) {
  const { productId, variantId, quantity = 1, paymentMethod = "loan" } = request.body;
  const userId = request.user.user.id;

  if(productId === "" || variantId === ""){
    const productId = null
    const variantId = null
  }

  try {
    validateProductOrVariant(productId, variantId);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const price = productId
      ? (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).basePrice
      : (await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })).price;

    const existingItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, variant: true },
    });

    let existingTotal = 0;
    for (const item of existingItems) {
      if (
        (productId && item.productId === productId) ||
        (variantId && item.variantId === variantId)
      ) {
        // Don't include this in existing total – we'll compute with updated quantity
        continue;
      }
      const itemPrice = item.product?.basePrice || item.variant?.price || 0;
      existingTotal += item.quantity * itemPrice;
    }

    const existingItem = existingItems.find(
      (i) =>
        (productId && i.productId === productId) ||
        (variantId && i.variantId === variantId)
    );

    const newTotal =
      existingTotal +
      (existingItem ? (existingItem.quantity + quantity) : quantity) * price;

    if (paymentMethod === "loan" && newTotal > user.loan_unit) {
      return response.status(400).json({
        status: "error",
        message: "Cannot add item. Loan limit exceeded.",
      });
    }

    const cartItem = await CartService.createOrUpdate({
      userId,
      productId,
      variantId,
      quantity,
    });

    return response.status(201).json(cartItem);
  } catch (error: any) {
    console.error("Add to Cart Error:", error);
    return response.status(400).json({ status: "error", message: error.message });
  }
}

// PUT /cart/:id
export async function updateCartItem(request: Request, response: Response) {
  const cartItemId = request.params.id;
  const { quantity, paymentMethod = "loan" } = request.body;
  const userId = request.user.user.id;

  if (typeof quantity !== "number" || quantity < 0) {
    return response.status(400).json({
      status: "error",
      message: "Quantity must be a non-negative number",
    });
  }

  try {
    const cartItem = await prisma.cartItem.findUniqueOrThrow({
      where: { id: cartItemId },
      include: { product: true, variant: true },
    });

    if (cartItem.userId !== userId) {
      return response.status(403).json({
        status: "error",
        message: "You do not have permission to update this item",
      });
    }

    if (quantity === 0) {
      await CartService.remove(cartItemId);
      return response.status(200).json({ message: "Item removed from cart" });
    }

    const price = cartItem.product?.basePrice || cartItem.variant?.price || 0;

    const otherItems = await prisma.cartItem.findMany({
      where: { userId, NOT: { id: cartItemId } },
      include: { product: true, variant: true },
    });

    const otherTotal = otherItems.reduce((sum, item) => {
      const p = item.product?.basePrice || item.variant?.price || 0;
      return sum + p * item.quantity;
    }, 0);

    const newTotal = otherTotal + quantity * price;

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (paymentMethod === "loan" && newTotal > user.loan_unit) {
      return response.status(400).json({
        status: "error",
        message: "Cannot update item. Loan limit exceeded.",
      });
    }

    const updated = await CartService.update(cartItemId, { quantity });
    return response.status(200).json(updated);
  } catch (error: any) {
    console.error("Update Cart Item Error:", error);
    return response.status(400).json({ status: "error", message: error.message });
  }
}

// GET /cart
export async function cartItems(request: Request, response: Response) {
  try {
    const userId = request.user.user.id;
    const items = await CartService.getAllByUser(userId);

    return response.status(200).json({
      message: items.length ? "Cart item(s) fetched" : "No cart items found",
      data: items,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}

// DELETE /cart/:id
export async function removeFromCart(request: Request, response: Response) {
  const { id } = request.params;

  try {
    const item = await CartService.remove(id);
    return response.json({ message: "Item removed from cart", item });
  } catch (error: any) {
    console.error("Remove item from cart error:", error);
    response.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Unexpected server error",
    });
  }
}

// DELETE /cart
export async function removeAllFromCart(request: Request, response: Response) {
  const userId = request.user.user.id;

  try {
    await prisma.cartItem.deleteMany({ where: { userId } });
    return response.json({ message: "All items removed from cart" });
  } catch (error: any) {
    console.error("Remove all from cart error:", error);
    response.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Unexpected server error",
    });
  }
}
