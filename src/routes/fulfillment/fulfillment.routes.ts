import express from "express";
import { fulfillmentAuthenticateJWT } from "../../middlewares/fulfillmentAuthenticationMiddleware";
import { addTrackingUpdate, all_order, getOrderTrackingHistory, single_order } from "../../controllers/fulfillmentController/order.controller";

export const fulfillmentRouter = express.Router();

fulfillmentRouter.use(fulfillmentAuthenticateJWT);

// Order Route Starts
fulfillmentRouter.get('/all-order', all_order)
fulfillmentRouter.get('/single-order', single_order)
// Tracking routes
fulfillmentRouter.post('/:orderId/tracking', addTrackingUpdate);
fulfillmentRouter.get('/:orderId/tracking',  getOrderTrackingHistory);