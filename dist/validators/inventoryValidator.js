"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInventory = void 0;
const express_validator_1 = require("express-validator");
exports.validateInventory = [
    (0, express_validator_1.body)("variantId")
        .notEmpty().withMessage("Variant ID is required.")
        .isString().withMessage("Variant ID must be a string."),
    (0, express_validator_1.body)("quantity")
        .notEmpty().withMessage("Quantity is required.")
        .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer."),
    (0, express_validator_1.body)("lowStockLevel")
        .optional()
        .isInt({ min: 0 }).withMessage("Low stock level must be a non-negative integer."),
    (0, express_validator_1.body)("batchNumber")
        .optional()
        .isString().withMessage("Batch number must be a string."),
    (0, express_validator_1.body)("warehouseId")
        .optional()
        .isString().withMessage("Warehouse ID must be a string."),
];
