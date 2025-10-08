"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getOne = exports.getAll = void 0;
const models_1 = require("../../models");
const handlePrismaErrors_1 = require("../../utils/handlePrismaErrors");
const prisma = new models_1.PrismaClient();
const getAll = async () => {
    return prisma.productVariant.findMany({ include: { product: true, inventory: true } });
};
exports.getAll = getAll;
const getOne = async (id) => {
    try {
        return await prisma.productVariant.findUniqueOrThrow({
            where: { id },
            include: { product: true, inventory: true }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.getOne = getOne;
const create = async (data) => {
    try {
        return prisma.productVariant.create({ data, include: { product: true, inventory: true } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.create = create;
const update = async (id, data) => {
    try {
        return prisma.productVariant.update({ where: { id }, data, include: { product: true, inventory: true } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.update = update;
const remove = async (id) => {
    try {
        return prisma.productVariant.delete({ where: { id } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.remove = remove;
