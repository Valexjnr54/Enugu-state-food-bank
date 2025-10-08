"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCSV = void 0;
// middlewares/uploadCSV.ts
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
exports.uploadCSV = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.csv$/)) {
            return cb(new Error("Only CSV files are allowed"));
        }
        cb(null, true);
    },
}).single("file");
