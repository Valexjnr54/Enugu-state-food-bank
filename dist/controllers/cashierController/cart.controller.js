"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCart = addToCart;
exports.updateCartItem = updateCartItem;
exports.cartItems = cartItems;
exports.removeFromCart = removeFromCart;
exports.removeAllFromCart = removeAllFromCart;
const models_1 = require("../../models");
const CartService = __importStar(require("../../services/userServices/cart.service"));
const prisma = new models_1.PrismaClient();
// Utility: Validate product or variant (not both or none)
function validateProductOrVariant(productId, variantId) {
    if (!productId && !variantId) {
        throw new Error("Either productId or variantId must be provided.");
    }
    if (productId && variantId) {
        throw new Error("Only one of productId or variantId should be provided.");
    }
}
// POST /cart
async function addToCart(request, response) {
    const { productId, variantId, quantity = 1, paymentMethod = "loan", userId } = request.body;
    if (productId === "" || variantId === "") {
        const productId = null;
        const variantId = null;
    }
    try {
        validateProductOrVariant(productId, variantId);
        const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
        if (user.status == "PENDING") {
            return response.status(400).json({ status: "error", message: 'Your Account is still pending\n\n, To finalize your registration, please ensure you have completed and submitted all necessary compliance documentation. If you have already done so, please note that our team is processing your submission and will notify you promptly upon verification.' });
        }
        if (user.status == "SUSPENDED") {
            return response.status(400).json({ status: "error", message: 'Your Account is still suspended, you can no longer partake in this service, Thanks.' });
        }
        const price = productId
            ? (await prisma.product.findUniqueOrThrow({ where: { id: productId } })).basePrice
            : (await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })).price;
        const existingItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true, variant: true },
        });
        let existingTotal = 0;
        for (const item of existingItems) {
            if ((productId && item.productId === productId) ||
                (variantId && item.variantId === variantId)) {
                // Don't include this in existing total – we'll compute with updated quantity
                continue;
            }
            const itemPrice = item.product?.basePrice || item.variant?.price || 0;
            existingTotal += item.quantity * itemPrice;
        }
        const existingItem = existingItems.find((i) => (productId && i.productId === productId) ||
            (variantId && i.variantId === variantId));
        const newTotal = existingTotal +
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
    }
    catch (error) {
        console.error("Add to Cart Error:", error);
        return response.status(400).json({ status: "error", message: error.message });
    }
}
// PUT /cart/:id
async function updateCartItem(request, response) {
    const cartItemId = request.params.id;
    const { quantity, paymentMethod = "loan", userId } = request.body;
    console.log("Request Body:", request.body);
    console.log("Cart Item ID:", cartItemId);
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
    }
    catch (error) {
        console.error("Update Cart Item Error:", error);
        return response.status(400).json({ status: "error", message: error.message });
    }
}
// GET /cart
async function cartItems(request, response) {
    try {
        const { userId } = request.body;
        const items = await CartService.getAllByUser(userId);
        return response.status(200).json({
            message: items.length ? "Cart item(s) fetched" : "No cart items found",
            data: items,
        });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal Server Error" });
    }
}
// DELETE /cart/:id
async function removeFromCart(request, response) {
    const { id } = request.params;
    try {
        const item = await CartService.remove(id);
        return response.json({ message: "Item removed from cart", item });
    }
    catch (error) {
        console.error("Remove item from cart error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
// DELETE /cart
async function removeAllFromCart(request, response) {
    const { userId } = request.body;
    try {
        await prisma.cartItem.deleteMany({ where: { userId } });
        return response.json({ message: "All items removed from cart" });
    }
    catch (error) {
        console.error("Remove all from cart error:", error);
        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
