import express from 'express';
import { authenticateJWT } from '../../middlewares/authenticationMiddleware';
import { loginFulfillmentOfficers, logoutFulfillmentOfficers } from '../../controllers/authControllers/fulfillmentAuthControler';


export const fulfillmentAuthRouter = express.Router();

fulfillmentAuthRouter.post('/fulfillment-officer-login', loginFulfillmentOfficers);
fulfillmentAuthRouter.all('/fulfillment-officer-logout', authenticateJWT, logoutFulfillmentOfficers)