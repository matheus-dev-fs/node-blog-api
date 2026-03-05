import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { privateRoute } from "../middlewares/private-route.middleware";

export const authRoutes: Router = Router();

authRoutes.post('/signup', authController.signup);
authRoutes.post('/signin', authController.signin);
authRoutes.post('/validate', privateRoute, authController.validate);