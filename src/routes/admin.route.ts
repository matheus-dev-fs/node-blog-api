import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { privateRoute } from "../middlewares/private-route.middleware";
import { upload } from "../libs/multer.lib";

export const adminRoutes: Router = Router();

adminRoutes.post('/posts', privateRoute, upload.single('cover'), adminController.addPost);
// adminRoutes.get('/posts', adminController.getPosts);
// adminRoutes.get('/posts/:slug', adminController.getPost);
// adminRoutes.put('/posts/:slug', adminController.editPost);
// adminRoutes.delete('/posts/:slug', adminController.removePost);