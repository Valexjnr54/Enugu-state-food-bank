"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allProduct = allProduct;
exports.singleProduct = singleProduct;
exports.single_order = single_order;
exports.confirm_user = confirm_user;
exports.confirm_delivery_order = confirm_delivery_order;
exports.generateQr = generateQr;
const models_1 = require("../../models");
const ProductService = __importStar(require("../../services/adminServices/product.service"));
const order_service_1 = require("../../services/userServices/order.service");
const otpHandler_1 = require("../../utils/otpHandler");
const sendSMS_1 = require("../../utils/sendSMS");
const qrcode_1 = __importDefault(require("qrcode"));
const prisma = new models_1.PrismaClient;
async function allProduct(request, response) {
    try {
        const allProjects = await ProductService.getAll();
        if (allProjects.length <= 0) {
            return response.status(200).json({ message: 'No Project(s) Found', data: allProjects });
        }
        return response.status(200).json({ message: 'Project(s) fetched', data: allProjects });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}
async function singleProduct(request, response) {
    const id = request.query.product_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Product ID is expected' });
    }
    try {
        const singleProduct = await ProductService.getOne(id);
        return response.status(200).json({ message: 'Product fetched', data: singleProduct });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function single_order(request, response) {
    const id = request.query.order_id;
    if (!id) {
        return response.status(400).json({ status: "error", message: 'Order ID is expected' });
    }
    try {
        const single_order = await (0, order_service_1.singleOrder)(id);
        return response.status(200).json({ message: 'Order fetched', data: single_order });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function confirm_user(request, response) {
    const { identifier, order_id } = request.body;
    if (!identifier) {
        return response.status(400).json({
            error: 'Missing identifier',
            message: 'You must provide an identifier (email, phone, or employee_id)',
        });
    }
    if (!order_id) {
        return response.status(400).json({ status: "error", message: 'Order ID is expected' });
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { employee_id: identifier },
                    { verification_id: identifier },
                    { phone: identifier }
                ],
            },
        });
        if (!user) {
            return response.status(404).json({
                error: 'User Not Found',
                message: 'No user found with provided identifier'
            });
        }
        const user_id = user.id;
        const order = await (0, order_service_1.singleOrderByUser)(user_id, order_id);
        if (!order) {
            return response.status(400).json({ status: "error", message: 'Order from this user could not be found/ Order does not belong to this user' });
        }
        const otp = await (0, otpHandler_1.generateOtp)();
        const updated_order = await prisma.order.update({ where: { id: order_id, userId: user_id }, data: { order_confirmation_otp: parseInt(otp, 10) } });
        const message = `Your Food Bank one-time password (OTP) is: ${otp}. Please provide this code to the dispatch rider upon delivery to confirm your order. The code expires in 10 minutes. Do not share it with anyone else.`;
        if (!order.user.phone) {
            return response.status(400).json({ status: "error", message: "User phone number is missing" });
        }
        await (0, sendSMS_1.sendSMS)(order.user.phone, message);
        return response.status(200).json({ message: 'Order User Confirmed', nextStep: 'confirm_order', data: updated_order });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function confirm_delivery_order(request, response) {
    const { user_id, order_id, otp } = request.body;
    if (!user_id) {
        return response.status(400).json({ status: "error", message: 'User ID is expected' });
    }
    if (!order_id) {
        return response.status(400).json({ status: "error", message: 'Order ID is expected' });
    }
    if (!otp) {
        return response.status(400).json({ status: "error", message: 'One-Time Password(OTP) is expected' });
    }
    try {
        const isValid = await (0, otpHandler_1.verifyOrderStoredOtp)(user_id, order_id, otp);
        if (!isValid) {
            return response.status(401).json({
                error: 'Invalid OTP',
                message: 'The OTP provided is incorrect or has expired'
            });
        }
        const order = await prisma.order.update({ where: { id: order_id, userId: user_id }, data: { orderStatus: "DELIVERED", deliveredAt: new Date() } });
        return response.status(200).json({ message: 'Order has been delivered', data: order });
    }
    catch (error) {
        const status = error.statusCode || 500;
        response.status(status).json({
            status: "error",
            message: error.message || "Unexpected error",
        });
    }
}
async function generateQr(request, response) {
    const id = request.query.order_id;
    try {
        const single_order = await (0, order_service_1.singleOrder)(id);
        /* 3. render PNG ------------------------------------------------- */
        const url = `https://enugu-state-food-bank.onrender.com/api/v1/delivery_order?order_id=${id}`;
        const pngBuffer = await qrcode_1.default.toBuffer(url, {
            type: 'png',
            width: 300,
            margin: 2,
            color: { dark: '#000', light: '#FFF' },
        });
        /* 4. return image ----------------------------------------------- */
        response.setHeader('Content-Type', 'image/png');
        response.setHeader('Content-Disposition', `inline; filename="qr-${single_order}.png"`);
        response.send(pngBuffer);
    }
    catch (error) {
        /* duplicate payload → return existing QR */
        if (error.code === 'P2002') {
            const existing = await (0, order_service_1.singleOrder)(id);
            const url = `https://enugu-state-food-bank.onrender.com/api/v1/delivery_order?order_id=${id}`;
            const png = await qrcode_1.default.toBuffer(url, { type: 'png', width: 300 });
            response.setHeader('Content-Type', 'image/png');
            response.send(png);
        }
        response.status(500).json({ error: 'QR generation failed' });
    }
}
