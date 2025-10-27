import express from "express";
import { allProduct, confirm_delivery_order, confirm_user, generateQr, listGovernmentEntities, single_order, singleProduct, usersByGovernmentEntity } from "../../controllers/miscController/misc.controller";

export const miscRouter = express.Router();

miscRouter.get('/products', allProduct);
miscRouter.get('/product', singleProduct);
miscRouter.get('/delivery_order', single_order);
miscRouter.post('/confirm-user-for-delivery', confirm_user);
miscRouter.post('/confirm-delivery-order', confirm_delivery_order);
miscRouter.get('/generate-qr-code', generateQr);
miscRouter.get('/user-by-government-entity', usersByGovernmentEntity);
miscRouter.get('/government-entity', listGovernmentEntities);