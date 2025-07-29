import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '../models';

const prisma = new PrismaClient();

export async function adminOnly(request: Request, response: Response, next: NextFunction) {
  const adminId = request.admin.admin.id;

  if (!adminId) {
    // console.log(adminId)
    return response.status(401).json({ message: 'Unauthorize' });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin || (admin.role !== Role.super_admin)) {
      return response.status(403).json({ status: "Forbidden Route" ,message: 'Only Admins are allowed to access this route' });
    }

    request.admin = { ...request.admin, role: admin.role }; // Optionally include role in request
    next();
  } catch (error) {
    console.error("An error occured:"+error);
    return response.status(500).json({ message: 'Server error' });
  }
}
