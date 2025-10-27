"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleUser = getSingleUser;
const models_1 = require("../../models");
const prisma = new models_1.PrismaClient;
async function getSingleUser(request, response) {
    const identifier = request.query.identifier;
    if (!identifier) {
        return response.status(400).json({
            error: 'Missing identifier',
            message: 'You must provide an identifier (email, phone, or employee_id)',
        });
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { employee_id: identifier },
                    { verification_id: identifier },
                    { phone: identifier }
                ],
            },
        });
        if (!user) {
            return response.status(404).json({
                error: 'User Not Found',
                message: 'No user found with provided identifier'
            });
        }
        if (!user.phone) {
            return response.status(200).json({
                message: 'User must set a new phone number',
                userId: user.id
            });
        }
        if (user.is_compliance_submitted == false) {
            return response.status(400).json({ status: "error", message: 'Your Account is still pending\n\n, To finalize your registration, please ensure you have completed and submitted all necessary consent documentation. If you have already done so, please note that our team is processing your submission and will notify you promptly upon verification.' });
        }
        if (user.status == "PENDING") {
            return response.status(400).json({ status: "error", message: 'Your Account is still pending\n\n, To finalize your registration, please ensure you have completed and submitted all necessary consent documentation. If you have already done so, please note that our team is processing your submission and will notify you promptly upon verification.' });
        }
        if (user.status == "SUSPENDED") {
            return response.status(400).json({ status: "error", message: 'Your Account is still suspended, you can no longer partake in this service, Thanks.' });
        }
        return response.status(200).json({ message: 'User fetched', data: user });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
