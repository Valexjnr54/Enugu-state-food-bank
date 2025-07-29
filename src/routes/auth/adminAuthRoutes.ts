import express from 'express';
import { upload } from '../../middlewares/multerMiddleware';
import { loginAdmin, logoutAdmin, registerAdmin } from '../../controllers/authControllers/adminAuthController';
import { authenticateJWT } from '../../middlewares/authenticationMiddleware';


export const adminAuthRouter = express.Router();

adminAuthRouter.post('/admin-register', upload.single('profile_image'), registerAdmin);
adminAuthRouter.post('/admin-login', loginAdmin);
adminAuthRouter.all('/admin-logout', authenticateJWT, logoutAdmin)