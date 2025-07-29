import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
  return prisma.inventory.findMany({ include: { variant: { include: { product:true }}, warehouse:true } });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.inventory.findUniqueOrThrow({
            where: { id },
            include: { variant: { include: { product:true }}, warehouse:true }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.inventory.create({ data, include: { variant: { include: { product:true }}, warehouse:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.inventory.update({ where: { id }, data, include: { variant: { include: { product:true }}, warehouse:true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.inventory.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
