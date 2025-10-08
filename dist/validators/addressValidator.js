"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddress = void 0;
const express_validator_1 = require("express-validator");
exports.validateAddress = [
    (0, express_validator_1.body)("label")
        .notEmpty().withMessage("Label is required")
        .isIn(["Home", "Office", "Other"]).withMessage("Label must be 'Home', 'Office', or 'Other'"),
    (0, express_validator_1.body)("street")
        .notEmpty().withMessage("Street is required"),
    (0, express_validator_1.body)("city")
        .notEmpty().withMessage("City is required"),
    (0, express_validator_1.body)("state")
        .notEmpty().withMessage("State is required"),
    (0, express_validator_1.body)("country")
        .notEmpty().withMessage("Country is required"),
    (0, express_validator_1.body)("zipCode")
        .optional()
        .isPostalCode("any").withMessage("Zip code must be a valid postal code"),
];
