import { PrismaClient } from '../../models';
import { handlePrismaError } from '../../utils/handlePrismaErrors';
const prisma = new PrismaClient();

export const getAll = async () => {
    return prisma.complianceForm.findMany({
        include: { user: true },
    });
};

export const getOne = async (id: string) => {
    try {
        return await prisma.complianceForm.findUniqueOrThrow({
            where: { id },
            include: { user: true },
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const getByUserId = async (userId: string) => {
    try {
        return await prisma.complianceForm.findFirst({
            where: { userId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const create = async (data: any) => {
    try {
        return prisma.complianceForm.create({ data, include: { user: true } });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const update = async (id: string, data: any) => {
    try {
        const updateCompliance= prisma.complianceForm.update({ where: { id }, data, include: { user: true } });

        console.log(data.status);
        
        // If status is APPROVED, update user status to ACTIVE
        if (data.status === 'APPROVED') {
            await updateUserStatus((await updateCompliance).userId, 'ACTIVE');
        }
        
        // If status is REJECTED, you might want to keep user as PENDING
        // or handle it differently based on your business logic
        if (data.status === 'DENIED') {
            await updateUserStatus((await updateCompliance).userId, 'PENDING');
        }

        return updateCompliance;
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

export const updateUserStatus = async (id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED') => {
    try {
        return await prisma.user.update({
            where: { id },
            data: { status }
        });
    } catch (error) {
        handlePrismaError(error);
    }
};

export const updateUserSubmission = async (id: string) => {
    try {
        return prisma.user.update({
            where: { id },
            data: { is_compliance_submitted: true}
        })
    } catch (error) {
        handlePrismaError(error)
    }
}
