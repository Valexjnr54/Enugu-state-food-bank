import express from "express";
import { allProduct, singleProduct } from "../../controllers/miscController/misc.controller";

export const miscRouter = express.Router();

miscRouter.get('/products', allProduct);
miscRouter.get('/product', singleProduct);