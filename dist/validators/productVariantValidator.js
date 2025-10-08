"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProductVariant = void 0;
const express_validator_1 = require("express-validator");
exports.validateProductVariant = [
    (0, express_validator_1.body)("sku")
        .notEmpty().withMessage("SKU is required.")
        .isString().withMessage("SKU must be a string."),
    (0, express_validator_1.body)("name")
        .notEmpty().withMessage("Name is required.")
        .isString().withMessage("Name must be a string."),
    (0, express_validator_1.body)("netWeight")
        .optional()
        .isFloat({ gt: 0 }).withMessage("Net weight must be a positive number."),
    (0, express_validator_1.body)("price")
        .notEmpty().withMessage("Price is required.")
        .isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
    (0, express_validator_1.body)("currency")
        .optional()
        .isString().withMessage("Currency must be a string."),
    (0, express_validator_1.body)("image")
        .optional()
        .isURL().withMessage("Image must be a valid URL."),
    (0, express_validator_1.body)("attributes")
        .optional()
        .isObject().withMessage("Attributes must be an object."),
    (0, express_validator_1.body)("expiryDate")
        .optional()
        .isISO8601().toDate().withMessage("Expiry date must be a valid ISO date string."),
    (0, express_validator_1.body)("productId")
        .notEmpty().withMessage("Product ID is required.")
        .isString().withMessage("Product ID must be a string."),
];
