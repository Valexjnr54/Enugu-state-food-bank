import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
  return prisma.warehouse.findMany({ include: {inventories: true} });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.warehouse.findUniqueOrThrow({
            where: { id },
            include: {inventories: true}
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.warehouse.create({ data, include: {inventories: true} });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.warehouse.update({ where: { id }, data, include: {inventories: true} });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.warehouse.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
