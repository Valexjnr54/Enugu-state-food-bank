import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
  return prisma.productVariant.findMany({ include:{ product:true, inventory:true } });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.productVariant.findUniqueOrThrow({
            where: { id },
            include:{ product:true, inventory:true }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.productVariant.create({ data, include:{ product:true, inventory:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.productVariant.update({ where: { id }, data, include:{ product:true, inventory:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.productVariant.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
