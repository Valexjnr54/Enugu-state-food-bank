import express from 'express';
import { authenticateJWT } from '../../middlewares/authenticationMiddleware';
import { loginCashier, logoutCashier } from '../../controllers/authControllers/cashierAuthController';


export const cashierAuthRouter = express.Router();

cashierAuthRouter.post('/cashier-login', loginCashier);
cashierAuthRouter.all('/cashier-logout', authenticateJWT, logoutCashier)