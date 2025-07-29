// middlewares/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};
