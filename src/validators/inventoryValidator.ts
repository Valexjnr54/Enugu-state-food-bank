import { body } from "express-validator";

export const validateInventory = [
  body("variantId")
    .notEmpty().withMessage("Variant ID is required.")
    .isString().withMessage("Variant ID must be a string."),

  body("quantity")
    .notEmpty().withMessage("Quantity is required.")
    .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer."),

  body("lowStockLevel")
    .optional()
    .isInt({ min: 0 }).withMessage("Low stock level must be a non-negative integer."),

  body("batchNumber")
    .optional()
    .isString().withMessage("Batch number must be a string."),

  body("warehouseId")
    .optional()
    .isString().withMessage("Warehouse ID must be a string."),
];
