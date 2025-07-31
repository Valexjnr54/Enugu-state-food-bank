import { Request, Response } from "express";
import * as WishlistService from "../../services/userServices/wishlist.service";

// View all wishlist items for a user
export async function getUserWishlist(request: Request, response: Response) {
  const userId = request.user.user.id;
  const wishlist = await WishlistService.getAllByUser(userId);
  return response.json({ status: "success", data: wishlist });
}

// Add item to wishlist
// export async function addToWishlist(request: Request, response: Response) {
//   const userId = request.user.user.id;
//   const { productId, variantId } = request.body;

//   if (!productId && !variantId) {
//     return response.status(400).json({ status: "error", message: "Either productId or variantId is required." });
//   }

//   if (productId && variantId) {
//     return response.status(400).json({ status: "error", message: "Only one of productId or variantId should be provided." });
//   }

//   if(productId === "" || variantId === ""){
//     const productId = null
//     const variantId = null
//   }


//   const item = await WishlistService.create({
//     userId,
//     productId: productId || undefined,
//     variantId: variantId || undefined,
//   });

//   return response.status(201).json({ status: "success", data: item });
// }
export async function addToWishlist(request: Request, response: Response) {
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
  } catch (error: any) {
    console.error("Add to Wishlist error:", error);
    return response.status(500).json({
      status: "error",
      message: error.message || "Unexpected server error",
    });
  }
}

// Remove a single wishlist item by ID
export async function removeFromWishlist(request: Request, response: Response) {
  const { id } = request.params;
  await WishlistService.remove(id);
  return response.json({ status: "success", message: "Item removed from wishlist." });
}

// Clear all wishlist items for the current user
export async function clearWishlist(request: Request, response: Response) {
  const userId = request.user.user.id;
  const items = await WishlistService.getAllByUser(userId);
  const deletion = items.map((item) => WishlistService.remove(item.id));
  await Promise.all(deletion);
  return response.json({ status: "success", message: "All wishlist items removed." });
}
