"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWarehouse = void 0;
const express_validator_1 = require("express-validator");
exports.validateWarehouse = [
    (0, express_validator_1.body)("name")
        .notEmpty().withMessage("Warehouse name is required.")
        .isString().withMessage("Warehouse name must be a string."),
    (0, express_validator_1.body)("address")
        .optional()
        .isString().withMessage("Address must be a string."),
    (0, express_validator_1.body)("city")
        .optional()
        .isString().withMessage("City must be a string."),
    (0, express_validator_1.body)("country")
        .optional()
        .isString().withMessage("Country must be a string."),
];
