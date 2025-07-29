import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
  return prisma.category.findMany({ include: { products:true, parent:true, children:true } });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.category.findUniqueOrThrow({
            where: { id },
            include: { products:true, parent:true, children:true }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.category.create({ data, include: { products:true, parent:true, children:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.category.update({ where: { id }, data, include: { products:true, parent:true, children:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.category.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
