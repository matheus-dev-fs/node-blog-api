import { Router, type Request, type Response } from "express";
import * as mainController from "../controllers/main.controller";

export const mainRoutes: Router = Router();

mainRoutes.get('/ping', (req: Request, res: Response): void => {
    res.status(200).json({ pong: true });
});

// mainRoutes.get('/posts', mainController.getAllPosts);
// mainRoutes.get('/posts/:slug', mainController.getPost);
// mainRoutes.get('/posts/:slug/related', mainController.getRelatedPosts);