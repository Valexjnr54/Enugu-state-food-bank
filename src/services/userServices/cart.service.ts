import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
  return prisma.cartItem.findMany({ include: { user:true, variant:true } });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.cartItem.findUniqueOrThrow({
            where: { id },
            include: { user:true, variant:true }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.cartItem.create({ data, include: { user:true, variant:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.cartItem.update({ where: { id }, data, include: { user:true, variant:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.cartItem.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
