import { NextFunction, Request, Response } from "express"

export const validateRequestBody = (requiredFields: string[]) => {
    return (request: Request, response: Response, next: NextFunction) => {
        if (!request.body || Object.keys(request.body).length === 0) {
            return response.status(400).json({
                success: false,
                error: 'Empty Request',
                message: 'Request body cannot be empty',
                requiredFields,
                example: {
                    ...requiredFields.reduce((account, field) => {
                        account[field] = field.includes('email') ? 'user@example.com' :
                                         field.includes('password') ? 'securePassword123' :
                                         'Example ' + field;
                        return account;
                    },{} as Record<string, string>)
                }
            });
        }

        const missingFields = requiredFields.filter(field => !request.body[field]);
        if (missingFields.length > 0) {
            return response.status(400).json({
                success: false,
                error: 'Missing Fields',
                message: 'Required fields are missing',
                missingFields,
                requiredFields
            });
        }

        next();
    };
};