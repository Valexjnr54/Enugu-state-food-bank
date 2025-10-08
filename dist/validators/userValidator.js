"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
const express_validator_1 = require("express-validator");
exports.validateUser = [
    (0, express_validator_1.body)("firstname").notEmpty().withMessage("First name is required"),
    (0, express_validator_1.body)("lastname").notEmpty().withMessage("Last name is required"),
    (0, express_validator_1.body)("email")
        .optional({ nullable: true, checkFalsy: true }) // accept null, "", or undefined
        .isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)("phone")
        .optional({ nullable: true, checkFalsy: true }) // accept null, "", or undefined
        .isMobilePhone("any").withMessage("Invalid phone number"),
    (0, express_validator_1.body)("level").notEmpty().withMessage("Level is required"),
    (0, express_validator_1.body)("employee_id").notEmpty().withMessage("Employee ID is required"),
    (0, express_validator_1.body)("verification_id").notEmpty().withMessage("Verification Number is required"),
    (0, express_validator_1.body)("government_entity").notEmpty().withMessage("Government entity is required"),
    (0, express_validator_1.body)("salary_per_month")
        .notEmpty().withMessage("Salary is required")
        .isFloat({ gt: 0 }).withMessage("Salary must be a positive number"),
];
