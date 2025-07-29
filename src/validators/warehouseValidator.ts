import { body } from "express-validator";

export const validateWarehouse = [
  body("name")
    .notEmpty().withMessage("Warehouse name is required.")
    .isString().withMessage("Warehouse name must be a string."),

  body("address")
    .optional()
    .isString().withMessage("Address must be a string."),

  body("city")
    .optional()
    .isString().withMessage("City must be a string."),

  body("country")
    .optional()
    .isString().withMessage("Country must be a string."),
];
