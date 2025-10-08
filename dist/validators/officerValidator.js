"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOfficer = void 0;
const express_validator_1 = require("express-validator");
exports.validateOfficer = [
    (0, express_validator_1.body)("firstname").notEmpty().withMessage("First name is required"),
    (0, express_validator_1.body)("lastname").notEmpty().withMessage("Last name is required"),
    (0, express_validator_1.body)("email")
        .notEmpty().withMessage("Email Address is required") // accept null, "", or undefined
        .isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)('username').notEmpty().withMessage('Username is reqired'),
];
