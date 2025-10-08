"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderValidator = void 0;
// validators/orderValidator.ts
const express_validator_1 = require("express-validator");
exports.createOrderValidator = [
    (0, express_validator_1.body)("addressId")
        .notEmpty()
        .withMessage("addressId is required")
        .isUUID()
        .withMessage("Invalid addressId format")
];
