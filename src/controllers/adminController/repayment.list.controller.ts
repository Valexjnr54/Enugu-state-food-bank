import { Request, Response } from 'express';
import { PrismaClient } from '../../models';
import { stringify } from 'csv-stringify';
import { promisify } from 'util';
import { pipeline } from 'stream';

const prisma = new PrismaClient();
const pipelineAsync = promisify(pipeline);

export async function exportUsersWithLoansAsCsv(request: Request, response: Response) {
    try {
        // Query users with loan_amount_collected > 0
        const users = await prisma.user.findMany({
            where: {
                loan_amount_collected: {
                    gt: 0
                }
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                phone: true,
                level: true,
                employee_id: true,
                government_entity: true,
                salary_per_month: true,
                loan_unit: true,
                loan_amount_collected: true,
                createdAt: true
            },
            orderBy: {
                loan_amount_collected: 'desc'
            }
        });

        if (users.length === 0) {
            return response.status(404).json({ message: 'No users with loan amounts collected found' });
        }

        // Set headers for CSV download
        response.setHeader('Content-Type', 'text/csv');
        response.setHeader('Content-Disposition', 'attachment; filename=users_with_loans.csv');

        // Define CSV columns
        const columns = {
            firstname: 'First Name',
            lastname: 'Last Name',
            email: 'Email',
            phone: 'Phone',
            level: 'Level',
            employee_id: 'Employee ID',
            government_entity: 'Government Entity',
            salary_per_month: 'Salary Per Month',
            loan_unit: 'Loan Unit',
            loan_amount_collected: 'Loan Amount Collected',
        };

        // Create CSV stringifier
        const stringifier = stringify({
            header: true,
            columns: columns
        });

        // Pipe the data through the stringifier to the response
        await pipelineAsync(
            users.map(user => ({
                ...user,
                createdAt: user.createdAt.toISOString()
            })),
            stringifier,
            response
        );

    } catch (error) {
        console.error('Error exporting users with loans:', error);
        response.status(500).json({ message: 'Failed to export users with loans', error: error });
    } finally {
        await prisma.$disconnect();
    }
}