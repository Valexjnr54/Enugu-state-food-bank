// utils/errors.ts
export class AppError extends Error {
  constructor(public message: string, public statusCode = 500) {
    super(message);
    this.name = "AppError";
  }
}

// src/utils/errors.ts
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

