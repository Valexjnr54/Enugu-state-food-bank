"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = adminOnly;
const models_1 = require("../models");
const prisma = new models_1.PrismaClient();
async function adminOnly(request, response, next) {
    const adminId = request.admin.admin.id;
    if (!adminId) {
        // console.log(adminId)
        return response.status(401).json({ message: 'Unauthorize' });
    }
    try {
        const admin = await prisma.admin.findUnique({ where: { id: adminId } });
        if (!admin || (admin.role !== models_1.Role.super_admin)) {
            return response.status(403).json({ status: "Forbidden Route", message: 'Only Admins are allowed to access this route' });
        }
        request.admin = { ...request.admin, role: admin.role }; // Optionally include role in request
        next();
    }
    catch (error) {
        console.error("An error occured:" + error);
        return response.status(500).json({ message: 'Server error' });
    }
}
