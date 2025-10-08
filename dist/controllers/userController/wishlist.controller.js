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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWishlist = getUserWishlist;
exports.addToWishlist = addToWishlist;
exports.removeFromWishlist = removeFromWishlist;
exports.clearWishlist = clearWishlist;
const WishlistService = __importStar(require("../../services/userServices/wishlist.service"));
// View all wishlist items for a user
async function getUserWishlist(request, response) {
    const userId = request.user.user.id;
    const wishlist = await WishlistService.getAllByUser(userId);
    return response.json({ status: "success", data: wishlist });
}
// Add item to wishlist
async function addToWishlist(request, response) {
    const userId = request.user.user.id;
    const { productId, variantId } = request.body;
    if (!productId && !variantId) {
        return response.status(400).json({
            status: "error",
            message: "Either productId or variantId is required.",
        });
    }
    if (productId && variantId) {
        return response.status(400).json({
            status: "error",
            message: "Only one of productId or variantId should be provided.",
        });
    }
    try {
        const existing = await WishlistService.find({
            userId,
            productId: productId || undefined,
            variantId: variantId || undefined,
        });
        if (existing) {
            return response.status(200).json({
                status: "info",
                message: "Item already exists in wishlist.",
                data: existing,
            });
        }
        const item = await WishlistService.create({
            userId,
            productId: productId || undefined,
            variantId: variantId || undefined,
        });
        return response.status(201).json({
            status: "success",
            message: "Item added to wishlist.",
            data: item,
        });
    }
    catch (error) {
        console.error("Add to Wishlist error:", error);
        return response.status(500).json({
            status: "error",
            message: error.message || "Unexpected server error",
        });
    }
}
// Remove a single wishlist item by ID
async function removeFromWishlist(request, response) {
    const { id } = request.params;
    await WishlistService.remove(id);
    return response.json({ status: "success", message: "Item removed from wishlist." });
}
// Clear all wishlist items for the current user
async function clearWishlist(request, response) {
    const userId = request.user.user.id;
    const items = await WishlistService.getAllByUser(userId);
    const deletion = items.map((item) => WishlistService.remove(item.id));
    await Promise.all(deletion);
    return response.json({ status: "success", message: "All wishlist items removed." });
}
