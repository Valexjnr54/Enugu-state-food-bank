import { body } from "express-validator";

export const validateProduct = [
  body("name")
    .notEmpty().withMessage("Product name is required.")
    .isString().withMessage("Product name must be a string."),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string."),

  body("brand")
    .optional()
    .isString().withMessage("Brand must be a string."),

  body("basePrice")
    .notEmpty().withMessage("Base price is required.")
    .isFloat({ gt: 0 }).withMessage("Base price must be a positive number."),

  body("currency")
    .optional()
    .isString().withMessage("Currency must be a string."),

  body("isPerishable")
    .optional()
    .isBoolean().withMessage("isPerishable must be a boolean."),

  body("shelfLifeDays")
    .optional()
    .isInt({ min: 1 }).withMessage("shelfLifeDays must be a positive integer."),

  body("unit")
    .optional()
    .isIn(["PIECE", "KG", "LITRE", "PACK", "SET"]) // Adjust to match your enum
    .withMessage("Invalid unit type."),

  body("packageType")
    .optional()
    .isString().withMessage("packageType must be a string."),

  body("active")
    .optional()
    .isBoolean().withMessage("Active must be a boolean."),

  body("categoryId")
    .optional()
    .isString().withMessage("categoryId must be a string."),
];

