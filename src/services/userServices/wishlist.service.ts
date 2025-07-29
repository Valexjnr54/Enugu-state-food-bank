import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
  return prisma.wishlistItem.findMany({ include: { user:true, variant:true } });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.wishlistItem.findUniqueOrThrow({
            where: { id },
            include: { user:true, variant:true }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.wishlistItem.create({ data, include: { user:true, variant:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.wishlistItem.update({ where: { id }, data, include: { user:true, variant:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.wishlistItem.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
