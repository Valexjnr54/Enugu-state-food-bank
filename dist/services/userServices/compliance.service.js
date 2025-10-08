"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSubmission = exports.updateUserStatus = exports.createOrUpdate = exports.remove = exports.update = exports.create = exports.getByUserId = exports.getOne = exports.getAll = void 0;
const models_1 = require("../../models");
const handlePrismaErrors_1 = require("../../utils/handlePrismaErrors");
const prisma = new models_1.PrismaClient();
const getAll = async () => {
    return prisma.complianceForm.findMany({
        include: { user: true },
    });
};
exports.getAll = getAll;
const getOne = async (id) => {
    try {
        return await prisma.complianceForm.findUniqueOrThrow({
            where: { id },
            include: { user: true },
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.getOne = getOne;
const getByUserId = async (userId) => {
    try {
        return await prisma.complianceForm.findFirst({
            where: { userId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.getByUserId = getByUserId;
const create = async (data) => {
    try {
        return prisma.complianceForm.create({ data, include: { user: true } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.create = create;
const update = async (id, data) => {
    try {
        const updateCompliance = prisma.complianceForm.update({ where: { id }, data, include: { user: true } });
        console.log(data.status);
        // If status is APPROVED, update user status to ACTIVE
        if (data.status === 'APPROVED') {
            await (0, exports.updateUserStatus)((await updateCompliance).userId, 'ACTIVE');
        }
        // If status is REJECTED, you might want to keep user as PENDING
        // or handle it differently based on your business logic
        if (data.status === 'DENIED') {
            await (0, exports.updateUserStatus)((await updateCompliance).userId, 'PENDING');
        }
        return updateCompliance;
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.update = update;
const remove = async (id) => {
    try {
        return prisma.complianceForm.delete({ where: { id } });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.remove = remove;
const createOrUpdate = async (data) => {
    try {
        // Check if a form already exists for this user
        const existingForm = await (0, exports.getByUserId)(data.userId);
        if (existingForm) {
            // Update the existing form
            return await (0, exports.update)(existingForm.id, {
                form_url: data.form_url,
                status: 'PENDING' // Reset status to PENDING when updating
            });
        }
        else {
            // Create a new form
            return await (0, exports.create)(data);
        }
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.createOrUpdate = createOrUpdate;
const updateUserStatus = async (id, status) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: { status }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.updateUserStatus = updateUserStatus;
const updateUserSubmission = async (id) => {
    try {
        return prisma.user.update({
            where: { id },
            data: { is_compliance_submitted: true }
        });
    }
    catch (error) {
        (0, handlePrismaErrors_1.handlePrismaError)(error);
    }
};
exports.updateUserSubmission = updateUserSubmission;
