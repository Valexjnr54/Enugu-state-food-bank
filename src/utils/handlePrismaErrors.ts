// utils/handlePrismaError.ts

import { PrismaClientKnownRequestError } from "../models/runtime/library";
import { AppError } from "./errors";

export const handlePrismaError = (error: unknown): never => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        throw new AppError("Record not found.", 404);
      case "P2002":
        throw new AppError("Duplicate record error.", 409);
      case "P2003":
        throw new AppError("Foreign key constraint failed.", 400);
      default:
        throw new AppError("Database error occurred.", 500);
    }
  }

  // If it's a normal Error object
  if (error instanceof Error) {
    throw new AppError(error.message, 500);
  }

  // Unknown case
  throw new AppError("Unknown server error.", 500);
};
