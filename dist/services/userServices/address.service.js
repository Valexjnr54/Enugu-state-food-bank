"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.findOne = exports.getOne = exports.getAllByUser = void 0;
const models_1 = require("../../models");
const handlePrismaErrors_1 = require("../../utils/handlePrismaErrors");
const prisma = new models_1.PrismaClient();
const getAllByUser = async (id) => {
    return prisma.address.findMany({ where: { userId: id }, include: { user: true } });
};
exports.getAllByUser = getAllByUser;
const getOne = async (id) => {
    try {
        return await prisma.address.findUniqueOrThrow({
            where: { id },
            include: { user: true }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.getOne = getOne;
const findOne = async (id) => {
    try {
        return await prisma.address.findFirst({
            where: { userId: id },
            include: { user: true }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.findOne = findOne;
const create = async (data) => {
    try {
        return prisma.address.create({ data, include: { user: true } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.create = create;
const update = async (id, data) => {
    try {
        return prisma.address.update({ where: { id }, data, include: { user: true } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.update = update;
const remove = async (id) => {
    try {
        return prisma.address.delete({ where: { id } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.remove = remove;
