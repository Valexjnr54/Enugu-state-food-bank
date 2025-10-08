"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillmentAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const authenticationMiddleware_1 = require("../../middlewares/authenticationMiddleware");
const fulfillmentAuthControler_1 = require("../../controllers/authControllers/fulfillmentAuthControler");
exports.fulfillmentAuthRouter = express_1.default.Router();
exports.fulfillmentAuthRouter.post('/fulfillment-officer-login', fulfillmentAuthControler_1.loginFulfillmentOfficers);
exports.fulfillmentAuthRouter.all('/fulfillment-officer-logout', authenticationMiddleware_1.authenticateJWT, fulfillmentAuthControler_1.logoutFulfillmentOfficers);
