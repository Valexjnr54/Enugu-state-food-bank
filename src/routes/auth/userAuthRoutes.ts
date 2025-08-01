import express from 'express';
import { upload } from '../../middlewares/multerMiddleware';
import { initiateLogin, logoutUser, registerUser, setPassword, verifyOtp, verifyPassword } from '../../controllers/authControllers/userAuthController';
import { userAuthenticateJWT } from '../../middlewares/userAuthenticationMiddleware';


export const userAuthRouter = express.Router();

userAuthRouter.post('/register', upload.single('profile_image'), registerUser);
userAuthRouter.post('/initiate-login', initiateLogin);
userAuthRouter.post('/set-password', setPassword);
userAuthRouter.post('/verify-password', verifyPassword);
userAuthRouter.post('/verify-otp', verifyOtp)
userAuthRouter.all('/logout', userAuthenticateJWT, logoutUser)