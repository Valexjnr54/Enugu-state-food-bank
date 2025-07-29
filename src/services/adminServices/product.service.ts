import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
    return prisma.product.findMany({
        include: { category:true, variants: true }
    });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.product.findUniqueOrThrow({
            where: { id },
            include: { category:true, variants: true }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.product.create({ data, include: { category:true, variants: true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.product.update({ where: { id }, data, include: { category:true, variants: true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.product.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
