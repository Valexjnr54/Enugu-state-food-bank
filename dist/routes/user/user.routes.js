"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const userAuthenticationMiddleware_1 = require("../../middlewares/userAuthenticationMiddleware");
const cart_controller_1 = require("../../controllers/userController/cart.controller");
const wishlist_controller_1 = require("../../controllers/userController/wishlist.controller");
const order_controller_1 = require("../../controllers/userController/order.controller");
const address_controller_1 = require("../../controllers/userController/address.controller");
const compliance_controller_1 = require("../../controllers/userController/compliance.controller");
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
exports.userRouter = express_1.default.Router();
exports.userRouter.use(userAuthenticationMiddleware_1.userAuthenticateJWT);
//Cart Route Starts
exports.userRouter.post('/cart/add-to-cart', cart_controller_1.addToCart);
exports.userRouter.delete('/cart/remove-from-cart/:id', cart_controller_1.removeFromCart);
exports.userRouter.delete('/cart/remove-all-from-cart', cart_controller_1.removeAllFromCart);
exports.userRouter.patch("/cart/update-cart/:id", cart_controller_1.updateCartItem);
exports.userRouter.get('/cart', cart_controller_1.cartItems);
//Cart Route Ends
//Wishlist Route Starts
exports.userRouter.get('/wishlist', wishlist_controller_1.getUserWishlist);
exports.userRouter.post('/wishlist/add-to-wishlist', wishlist_controller_1.addToWishlist);
exports.userRouter.delete('/wishlist/remove-from-wishlist/:id', wishlist_controller_1.removeFromWishlist);
exports.userRouter.delete('/wishlist/remove-all-from-wishlist', wishlist_controller_1.clearWishlist);
//Wishlist Route Ends
// Order Route Starts
exports.userRouter.post('/create-order', order_controller_1.create_order);
exports.userRouter.get('/all-order', order_controller_1.all_order);
exports.userRouter.get('/single-order', order_controller_1.single_order);
// Order Route Ends
// Address Route Starts
exports.userRouter.post('/address/add-address', address_controller_1.createAddress);
exports.userRouter.get('/address', address_controller_1.getAllAddress);
exports.userRouter.get('/address/single-address', address_controller_1.getSingleAddress);
exports.userRouter.patch('/address/update-address', address_controller_1.updateAddress);
exports.userRouter.delete('/address/delete-address', address_controller_1.deleteAddress);
// Address Route Ends
//Compliance Form Starts
exports.userRouter.get('/get-compliance', compliance_controller_1.get_compliance);
exports.userRouter.post('/add-compliance', multerMiddleware_1.upload.fields([{ name: "compliance_form", maxCount: 1 }]), compliance_controller_1.add_compliance);
// Compliance Form Ends
