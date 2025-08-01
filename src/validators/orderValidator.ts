// validators/orderValidator.ts
import { body } from "express-validator";

export const createOrderValidator = [
  body("addressId")
    .notEmpty()
    .withMessage("addressId is required")
    .isUUID()
    .withMessage("Invalid addressId format")
];
