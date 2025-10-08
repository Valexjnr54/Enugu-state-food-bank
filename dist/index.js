"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const port = process.env.PORT || 9000;
const host = process.env.HOST || "127.0.0.1";
app_1.default.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
