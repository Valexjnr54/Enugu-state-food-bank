"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getOne = exports.find = exports.getAllByUser = exports.getAll = void 0;
const models_1 = require("../../models");
const handlePrismaErrors_1 = require("../../utils/handlePrismaErrors");
const prisma = new models_1.PrismaClient();
const getAll = async () => {
    return prisma.wishlistItem.findMany({ include: { user: true, variant: true } });
};
exports.getAll = getAll;
const getAllByUser = async (id) => {
    return prisma.wishlistItem.findMany({ where: { userId: id }, include: { user: true, variant: true } });
};
exports.getAllByUser = getAllByUser;
const find = async ({ userId, productId, variantId, }) => {
    try {
        return await prisma.wishlistItem.findFirst({
            where: {
                userId,
                productId: productId ?? undefined,
                variantId: variantId ?? undefined,
            },
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.find = find;
const getOne = async (id) => {
    try {
        return await prisma.wishlistItem.findUniqueOrThrow({
            where: { id },
            include: { user: true, variant: true }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.getOne = getOne;
const create = async (data) => {
    try {
        const { userId, productId, variantId } = data;
        const exists = await prisma.wishlistItem.findFirst({
            where: {
                userId,
                productId: productId ?? undefined,
                variantId: variantId ?? undefined,
            },
        });
        if (exists)
            return exists;
        return prisma.wishlistItem.create({
            data,
            include: { user: true, variant: true, product: true },
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.create = create;
const update = async (id, data) => {
    try {
        return prisma.wishlistItem.update({ where: { id }, data, include: { user: true, variant: true } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.update = update;
const remove = async (id) => {
    try {
        return prisma.wishlistItem.delete({ where: { id } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.remove = remove;
