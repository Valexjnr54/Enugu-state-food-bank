"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
const adminAuthController_1 = require("../../controllers/authControllers/adminAuthController");
const authenticationMiddleware_1 = require("../../middlewares/authenticationMiddleware");
exports.adminAuthRouter = express_1.default.Router();
exports.adminAuthRouter.post('/admin-register', multerMiddleware_1.upload.single('profile_image'), adminAuthController_1.registerAdmin);
exports.adminAuthRouter.post('/admin-login', adminAuthController_1.loginAdmin);
exports.adminAuthRouter.all('/admin-logout', authenticationMiddleware_1.authenticateJWT, adminAuthController_1.logoutAdmin);
