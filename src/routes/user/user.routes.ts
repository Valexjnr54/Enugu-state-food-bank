import express from "express";
import { userAuthenticateJWT } from "../../middlewares/userAuthenticationMiddleware";
import { addToCart, cartItems, removeAllFromCart, removeFromCart, updateCartItem } from "../../controllers/userController/cart.controller";
import { addToWishlist, clearWishlist, getUserWishlist, removeFromWishlist } from "../../controllers/userController/wishlist.controller";
import { all_order, create_order, single_order } from "../../controllers/userController/order.controller";
import { createAddress, deleteAddress, getAllAddress, getSingleAddress, updateAddress } from "../../controllers/userController/address.controller";
import { add_compliance, get_compliance } from "../../controllers/userController/compliance.controller";
import { upload } from "../../middlewares/multerMiddleware";

export const userRouter = express.Router();

userRouter.use(userAuthenticateJWT);

//Cart Route Starts
userRouter.post('/cart/add-to-cart', addToCart);
userRouter.delete('/cart/remove-from-cart/:id', removeFromCart);
userRouter.delete('/cart/remove-all-from-cart', removeAllFromCart);
userRouter.patch("/cart/update-cart/:id", updateCartItem);
userRouter.get('/cart', cartItems);
//Cart Route Ends

//Wishlist Route Starts
userRouter.get('/wishlist', getUserWishlist);
userRouter.post('/wishlist/add-to-wishlist', addToWishlist);
userRouter.delete('/wishlist/remove-from-wishlist/:id', removeFromWishlist);
userRouter.delete('/wishlist/remove-all-from-wishlist', clearWishlist);
//Wishlist Route Ends

// Order Route Starts
userRouter.post('/create-order', create_order);
userRouter.get('/all-order', all_order)
userRouter.get('/single-order', single_order)
// Order Route Ends

// Address Route Starts
userRouter.post('/address/add-address', createAddress);
userRouter.get('/address', getAllAddress);
userRouter.get('/address/single-address', getSingleAddress)
userRouter.patch('/address/update-address', updateAddress);
userRouter.delete('/address/delete-address', deleteAddress);
// Address Route Ends

//Compliance Form Starts
userRouter.get('/get-compliance', get_compliance)
userRouter.post('/add-compliance', upload.fields([ { name: "compliance_form", maxCount: 1 } ]), add_compliance)
// Compliance Form Ends