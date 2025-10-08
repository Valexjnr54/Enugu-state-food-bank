"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthenticateJWT = userAuthenticateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
function userAuthenticateJWT(request, response, next) {
    const token = request.header('Authorization');
    if (!token) {
        return response.status(401).json({ message: 'Unauthorized: Access Token Missing' });
    }
    jsonwebtoken_1.default.verify(token.replace('Bearer ', ''), config_1.Config.secret, (error, user) => {
        if (error) {
            return response.status(403).json({ message: 'Forbidden: Invalid Token' });
        }
        request.user = user;
        next();
    });
}
