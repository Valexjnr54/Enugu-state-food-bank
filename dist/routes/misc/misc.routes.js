"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.miscRouter = void 0;
const express_1 = __importDefault(require("express"));
const misc_controller_1 = require("../../controllers/miscController/misc.controller");
exports.miscRouter = express_1.default.Router();
exports.miscRouter.get('/products', misc_controller_1.allProduct);
exports.miscRouter.get('/product', misc_controller_1.singleProduct);
exports.miscRouter.get('/delivery_order', misc_controller_1.single_order);
exports.miscRouter.post('/confirm-user-for-delivery', misc_controller_1.confirm_user);
exports.miscRouter.post('/confirm-delivery-order', misc_controller_1.confirm_delivery_order);
exports.miscRouter.get('/generate-qr-code', misc_controller_1.generateQr);
