import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
    return prisma.fulfillment_officers.findMany({});
};

export const getOne = async (id: number) => {
    try {
        return await prisma.fulfillment_officers.findUniqueOrThrow({
            where: { id },
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.fulfillment_officers.create({ data });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: number, data: any) => {
    try {
        return prisma.fulfillment_officers.update({ where: { id }, data });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: number) => {
    try {
        return prisma.fulfillment_officers.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};
