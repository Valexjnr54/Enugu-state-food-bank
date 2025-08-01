import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAllByUser = async (id: string) => {
  return prisma.address.findMany({ include: {user: true} });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.address.findUniqueOrThrow({
            where: { id },
            include: {user: true}
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const findOne = async (id: string) => {
    try {
        return await prisma.address.findFirst({
            where: { userId: id },
            include: {user: true}
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.address.create({ data, include: {user: true} });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.address.update({ where: { id }, data, include: {user: true} });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.address.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
