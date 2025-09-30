import express from "express";
import { cashierAuthenticateJWT } from "../../middlewares/cashierAuthenticationMiddleware";
import { getSingleUser } from "../../controllers/cashierController/user.controller";
import { all_order, create_order, single_order } from "../../controllers/cashierController/order.controller";
import { addToCart, cartItems, removeAllFromCart, removeFromCart, updateCartItem } from "../../controllers/cashierController/cart.controller";


export const cashierRouter = express.Router();

cashierRouter.use(cashierAuthenticateJWT);

//User Route Start
cashierRouter.get('/user', getSingleUser);
//User Route End

// Order Route Starts
cashierRouter.post('/create-order', create_order);
cashierRouter.get('/all-order', all_order)
cashierRouter.get('/single-order', single_order)
// Order Route Ends

//Cart Route Starts
cashierRouter.post('/cart/add-to-cart', addToCart);
cashierRouter.delete('/cart/remove-from-cart/:id', removeFromCart);
cashierRouter.delete('/cart/remove-all-from-cart', removeAllFromCart);
cashierRouter.patch("/cart/update-cart/:id", updateCartItem);
cashierRouter.get('/cart', cartItems);
//Cart Route Ends