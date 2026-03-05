import type { NextFunction, Response } from "express";
import { verifyRequest } from "../services/auth.service";
import type { SafeUser, UserTokenPayload } from "../types/user.types";
import type { Result } from "../types/result.types";
import type { ExtendedRequest } from "../types/extended-request.types";

export const privateRoute = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user: Result<SafeUser> = await verifyRequest(req);

    if (!user.success) {
        res.status(401).json({ error: user.error });
        return;
    }

    req.user = user.data;
    next();
};