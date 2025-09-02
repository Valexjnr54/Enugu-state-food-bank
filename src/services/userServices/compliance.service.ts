import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
    return prisma.complianceForm.findMany({
        
    });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.complianceForm.findUniqueOrThrow({
            where: { id }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const getByUserId = async (userId: string) => {
    try {
        return await prisma.complianceForm.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.complianceForm.create({ data });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        return prisma.complianceForm.update({ where: { id }, data });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const remove = async (id: string) => {
    try {
        return prisma.complianceForm.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const createOrUpdate = async (data: any) => {
    try {
        // Check if a form already exists for this user
        const existingForm = await getByUserId(data.userId);
        
        if (existingForm) {
            // Update the existing form
            return await update(existingForm.id, {
                form_url: data.form_url,
                status: 'PENDING' // Reset status to PENDING when updating
            });
        } else {
            // Create a new form
            return await create(data);
        }
    } catch (error) {
        handlePrismaError(error);
    }
};
