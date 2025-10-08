"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllByUser = getAllByUser;
exports.createOrUpdate = createOrUpdate;
exports.update = update;
exports.remove = remove;
exports.clearCart = clearCart;
const models_1 = require("../../models");
const handlePrismaErrors_1 = require("../../utils/handlePrismaErrors");
const prisma = new models_1.PrismaClient();
async function getAllByUser(userId) {
    return prisma.cartItem.findMany({
        where: { userId },
        include: { product: true, variant: true },
    });
}
;
async function createOrUpdate({ userId, productId, variantId, quantity, }) {
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
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
;
async function update(cartItemId, data) {
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
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
;
async function remove(id) {
    try {
        return prisma.cartItem.delete({ where: { id } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
}
;
async function clearCart(userId) {
    const items = await prisma.cartItem.findMany({ where: { userId } });
    const deletions = items.map((item) => prisma.cartItem.delete({ where: { id: item.id } }));
    await Promise.all(deletions);
    return true;
}
;
