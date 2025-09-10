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
                verification_id: true,
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

        // Static values
        const deductionName = "EN-FOOD SCHEME";
        const valueType = 2;
        const durationType = 1;

        // Dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 5);

        // Format as YYYY-MM-DD
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        // Set headers for CSV download
        response.setHeader('Content-Type', 'text/csv');
        response.setHeader('Content-Disposition', 'attachment; filename=users_with_loans.csv');

        // Define CSV columns
        const columns = {
            verification_id: 'PSN',
            deductionName: 'DeductionName',
            valueType: 'ValueType',
            loan_amount_collected: 'Amount',
            durationType: 'DurationType',
            startDate: 'StartDate',
            endDate: 'EndDate'
        };

        // Create CSV stringifier
        const stringifier = stringify({
            header: true,
            columns
        });

        // Add constants + dates into each row
        const rows = users.map(user => ({
            verification_id: user.verification_id,
            deductionName,
            valueType,
            loan_amount_collected: user.loan_amount_collected,
            durationType,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        }));

        // Pipe the data through the stringifier to the response
        await pipelineAsync(
            rows,
            stringifier,
            response
        );

    } catch (error) {
        console.error('Error exporting users with loans:', error);
        response.status(500).json({ message: 'Failed to export users with loans', error });
    } finally {
        await prisma.$disconnect();
    }
}