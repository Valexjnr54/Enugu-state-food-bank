"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProduct = void 0;
const express_validator_1 = require("express-validator");
exports.validateProduct = [
    (0, express_validator_1.body)("name")
        .notEmpty().withMessage("Product name is required.")
        .isString().withMessage("Product name must be a string."),
    (0, express_validator_1.body)("description")
        .optional()
        .isString().withMessage("Description must be a string."),
    (0, express_validator_1.body)("brand")
        .optional()
        .isString().withMessage("Brand must be a string."),
    (0, express_validator_1.body)("basePrice")
        .notEmpty().withMessage("Base price is required.")
        .isFloat({ gt: 0 }).withMessage("Base price must be a positive number."),
    (0, express_validator_1.body)("currency")
        .optional()
        .isString().withMessage("Currency must be a string."),
    (0, express_validator_1.body)("isPerishable")
        .optional()
        .isBoolean().withMessage("isPerishable must be a boolean."),
    (0, express_validator_1.body)("shelfLifeDays")
        .optional()
        .isInt({ min: 1 }).withMessage("shelfLifeDays must be a positive integer."),
    (0, express_validator_1.body)("unit")
        .optional()
        .isIn(["KG", "GRAM", "LITER", "ML", "PIECE", "PACK", "BOTTLE", "CAN", "JAR", "BOX", "BAG", "PAINTER"]) // Adjust to match your enum
        .withMessage("Invalid unit type."),
    (0, express_validator_1.body)("packageType")
        .optional()
        .isString().withMessage("packageType must be a string."),
    (0, express_validator_1.body)("active")
        .optional()
        .isBoolean().withMessage("Active must be a boolean."),
    (0, express_validator_1.body)("categoryId")
        .optional()
        .isString().withMessage("categoryId must be a string."),
];
