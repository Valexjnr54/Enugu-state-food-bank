import express from "express";
import { userAuthenticateJWT } from "../../middlewares/userAuthenticationMiddleware";
import { addToCart, cartItems, removeAllFromCart, removeFromCart, updateCartItem } from "../../controllers/userController/cart.controller";
import { addToWishlist, clearWishlist, getUserWishlist, removeFromWishlist } from "../../controllers/userController/wishlist.controller";

export const userRouter = express.Router();

userRouter.use(userAuthenticateJWT);

userRouter.post('/cart/add-to-cart', addToCart);
userRouter.delete('/cart/remove-from-cart/:id', removeFromCart);
userRouter.delete('/cart/remove-all-from-cart', removeAllFromCart);
userRouter.patch("/cart/update-cart/:id", updateCartItem);
userRouter.get('/cart', cartItems)

userRouter.get('/wishlist', getUserWishlist);
userRouter.post('/wishlist/add-to-wishlist', addToWishlist);
userRouter.delete('/wishlist/remove-from-wishlist/:id', removeFromWishlist);
userRouter.delete('/wishlist/remove-all-from-wishlist', clearWishlist);