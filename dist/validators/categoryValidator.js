"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCategory = void 0;
const express_validator_1 = require("express-validator");
exports.validateCategory = [
    (0, express_validator_1.body)("name")
        .notEmpty().withMessage("Category name is required.")
        .isString().withMessage("Category name must be a string."),
    (0, express_validator_1.body)("slug")
        .optional()
        .isString().withMessage("Slug must be a string."),
    (0, express_validator_1.body)("parentId")
        .optional()
        .isString().withMessage("Parent ID must be a string."),
];
