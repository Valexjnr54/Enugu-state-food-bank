import { Request, Response } from "express";
import { PrismaClient } from "../../models";
import * as UserService from '../../services/adminServices/user.service';
import { ValidationChain, validationResult } from "express-validator";
import { validateUser } from "../../validators/userValidator";
import { PrismaClientKnownRequestError } from "../../models/runtime/library";
import path from "path";

const prisma = new PrismaClient;

export async function getAllUser(request: Request, response: Response) {
    try {
        const allUsers = await UserService.getAll()
        if(allUsers.length <= 0){
            return response.status(200).json({ message: 'No User(s) Found', data:allUsers });
        }
        return response.status(200).json({message: 'User(s) fetched', data: allUsers });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function getSingleUser(request: Request, response: Response) {
    const id: string = request.query.user_id as string;

    if (!id) {
       return response.status(400).json({status:"error", message: 'User ID is expected' }); 
    }
    
    try {
        const singleUser = await UserService.getOne(id)
        return response.status(200).json({message: 'User fetched', data: singleUser });
    } catch (error: any) {
        const status = error.statusCode || 500;
        response.status(status).json({
        status: "error",
        message: error.message || "Unexpected error",
        });
    }
}

export async function createUser(request: Request, response: Response) {
    try {
        await Promise.all(validateUser.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            firstname,
            lastname,
            email,
            phone,
            level,
            employee_id,
            government_entity,
            salary_per_month,
        } = request.body;

        const percent = 30/100

        const loan_unit = (percent * parseFloat(salary_per_month));

        const user = await UserService.create({
            firstname,
            lastname,
            email,
            phone,
            level,
            employee_id,
            government_entity,
            salary_per_month,
            loan_unit
        });

        return response.status(201).json({
            status: "success",
            message: "User created successfully",
            data: user,
        });

    } catch (error: any) {
        if (error.name === "ZodError") {
            console.log(error)
            return response.status(400).json({ message: "Validation failed", errors: error.errors });
        }

        response.status(error.statusCode || 500).json({
            status: "error",
            message: error.message || "Server error",
        });
    }
}

export async function updateUser(request: Request, response: Response) {
    const id: string = request.query.user_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "User ID is expected" });
    }

    try {
        await Promise.all(validateUser.map((rule) => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const {
            firstname,
            lastname,
            email,
            phone,
            level,
            employee_id,
            government_entity,
            salary_per_month,
        } = request.body;

        const percent = 30/100

        const loan_unit = (percent * parseFloat(salary_per_month));

        const updatedUser = await UserService.update(id, {
            firstname,
            lastname,
            email,
            phone,
            level,
            employee_id,
            government_entity,
            salary_per_month,
            loan_unit
        });

        return response.status(200).json({ status: "success", message: "User updated successfully", data: updatedUser, });

    } catch (error: any) {
        console.error("User update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

export async function deleteUser(request: Request, response: Response) {
    const id: string = request.query.user_id as string;

    if (!id) {
        return response.status(400).json({ status: "error", message: "User ID is expected" });
    }

    try {
        const deleteUser = await UserService.remove(id);

        return response.status(200).json({ status: "success", message: "User delete successfully", data: {}, });
    } catch (error: any) {
        console.error("User update error:", error);
        response.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Unexpected server error",
        });
    }
}

// Helper to run validation against a plain object
const runValidation = async (data: any, validations: ValidationChain[]) => {
  const fakeReq = {
            body: data,
            headers: {},
            get: () => "", // Required by express-validator
        } as any;
  for (const validation of validations) {
    await validation.run(fakeReq as any);
  }
  const result = validationResult(fakeReq as any);
  return result;
};

export async function uploadUsersFromCSV(request: Request, response: Response){
    if (!request.file) {
        return response.status(400).json({ error: "CSV file is required" });
    }

    const results: any[] = [];
    const errors: any[] = [];

    const content = request.file.buffer.toString("utf-8");
    const rows = content.split("\n").map((line) => line.trim()).filter(Boolean);
    const headers = rows[0].split(",").map((h) => h.trim());

    const percent = 30/100

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(",").map((v) => v.trim());
        const rowData: any = {};

        headers.forEach((header, index) => {
            rowData[header] = values[index];
        });

        // Set email to null if empty
        if (!rowData.email || rowData.email === "") {
            rowData.email = null;
        }

        // Convert float fields
        rowData.salary_per_month = parseFloat(rowData.salary_per_month);
        
        const loan_unit  = (percent * parseFloat(rowData.salary_per_month));
        
        // // Run validation on this row
        const result = await runValidation(rowData, validateUser);

        if (!result.isEmpty()) {
            errors.push({
                row: i + 1,
                errors: result.array(),
        });
            continue;
        }

        try {
            const userData = {
                ...rowData,
                loan_unit,
            };

            const savedUser = await UserService.create(userData);
            results.push(savedUser);
        } catch (err: any) {
            if (err instanceof PrismaClientKnownRequestError) {
                errors.push({ row: i + 1, message: err.message });
            } else {
                errors.push({ row: i + 1, message: "Unknown error" });
            }
        }
    }

    return response.status(201).json({
        message: `${results.length} user(s) uploaded successfully.`,
        success: results,
        failed: errors,
    });
}

export async function downloadUserTemplate(request: Request, response: Response) {
  const filePath = path.resolve("./public/templates/user_upload_template.csv");

  response.download(filePath, "user_upload_template.csv", (error) => {
    if (error) {
      console.error("❌ Error sending template file:", error);
      response.status(500).json({ error: "Could not download template file." });
    }
  });
};