"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashierAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const authenticationMiddleware_1 = require("../../middlewares/authenticationMiddleware");
const cashierAuthController_1 = require("../../controllers/authControllers/cashierAuthController");
exports.cashierAuthRouter = express_1.default.Router();
exports.cashierAuthRouter.post('/cashier-login', cashierAuthController_1.loginCashier);
exports.cashierAuthRouter.all('/cashier-logout', authenticationMiddleware_1.authenticateJWT, cashierAuthController_1.logoutCashier);
