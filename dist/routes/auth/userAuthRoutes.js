"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
const userAuthController_1 = require("../../controllers/authControllers/userAuthController");
const userAuthenticationMiddleware_1 = require("../../middlewares/userAuthenticationMiddleware");
exports.userAuthRouter = express_1.default.Router();
exports.userAuthRouter.post('/register', multerMiddleware_1.upload.single('profile_image'), userAuthController_1.registerUser);
exports.userAuthRouter.post('/initiate-login', userAuthController_1.initiateLogin);
exports.userAuthRouter.post('/set-password', userAuthController_1.setPassword);
exports.userAuthRouter.post('/set-phone-number', userAuthController_1.setPhoneNumber);
exports.userAuthRouter.post('/verify-password', userAuthController_1.verifyPassword);
exports.userAuthRouter.post('/verify-otp', userAuthController_1.verifyOtp);
exports.userAuthRouter.post('/resend-otp', userAuthController_1.resendOtp);
exports.userAuthRouter.all('/logout', userAuthenticationMiddleware_1.userAuthenticateJWT, userAuthController_1.logoutUser);
