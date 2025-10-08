"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashierRouter = void 0;
const express_1 = __importDefault(require("express"));
const cashierAuthenticationMiddleware_1 = require("../../middlewares/cashierAuthenticationMiddleware");
const user_controller_1 = require("../../controllers/cashierController/user.controller");
const order_controller_1 = require("../../controllers/cashierController/order.controller");
const cart_controller_1 = require("../../controllers/cashierController/cart.controller");
exports.cashierRouter = express_1.default.Router();
exports.cashierRouter.use(cashierAuthenticationMiddleware_1.cashierAuthenticateJWT);
//User Route Start
exports.cashierRouter.get('/user', user_controller_1.getSingleUser);
//User Route End
// Order Route Starts
exports.cashierRouter.post('/create-order', order_controller_1.create_order);
exports.cashierRouter.get('/all-order', order_controller_1.all_order);
exports.cashierRouter.get('/single-order', order_controller_1.single_order);
// Order Route Ends
//Cart Route Starts
exports.cashierRouter.post('/cart/add-to-cart', cart_controller_1.addToCart);
exports.cashierRouter.delete('/cart/remove-from-cart/:id', cart_controller_1.removeFromCart);
exports.cashierRouter.delete('/cart/remove-all-from-cart', cart_controller_1.removeAllFromCart);
exports.cashierRouter.patch("/cart/update-cart/:id", cart_controller_1.updateCartItem);
exports.cashierRouter.get('/cart', cart_controller_1.cartItems);
//Cart Route Ends
