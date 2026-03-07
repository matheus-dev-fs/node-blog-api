import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { privateRoute } from "../middlewares/private-route.middleware";
import { upload } from "../libs/multer.lib";

export const adminRoutes: Router = Router();

adminRoutes.post('/posts', privateRoute, upload.single('cover'), adminController.addPost);
adminRoutes.get('/posts', privateRoute, adminController.getPosts);
// adminRoutes.get('/posts/:slug', adminController.getPost);
adminRoutes.put('/posts/:slug', privateRoute, upload.single('cover'), adminController.editPost);
adminRoutes.delete('/posts/:slug', privateRoute, adminController.removePost);