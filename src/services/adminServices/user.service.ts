import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
    return prisma.user.findMany({
        include: { addresses: true, orders:true, cart_items:true, wishlist:true }
    });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.user.findUniqueOrThrow({
            where: { id },
            include: { addresses: true, orders:true, cart_items:true, wishlist:true }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.user.create({ data, include: { addresses: true, orders:true, cart_items:true, wishlist:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.user.update({ where: { id }, data, include: { addresses: true, orders:true, cart_items:true, wishlist:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.user.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
