import { body } from "express-validator";

export const validateProductVariant = [
  body("sku")
    .notEmpty().withMessage("SKU is required.")
    .isString().withMessage("SKU must be a string."),

  body("name")
    .notEmpty().withMessage("Name is required.")
    .isString().withMessage("Name must be a string."),

  body("netWeight")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Net weight must be a positive number."),

  body("price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ gt: 0 }).withMessage("Price must be a positive number."),

  body("currency")
    .optional()
    .isString().withMessage("Currency must be a string."),

  body("image")
    .optional()
    .isURL().withMessage("Image must be a valid URL."),

  body("attributes")
    .optional()
    .isObject().withMessage("Attributes must be an object."),

  body("expiryDate")
    .optional()
    .isISO8601().toDate().withMessage("Expiry date must be a valid ISO date string."),

  body("productId")
    .notEmpty().withMessage("Product ID is required.")
    .isString().withMessage("Product ID must be a string."),
];
