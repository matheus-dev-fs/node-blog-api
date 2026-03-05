import type { RequestHandler, Response } from "express";
import { signinSchema, signupSchema } from "../schemas/auth.schema";
import { getZodErrors } from "../utils/zod.util";
import { authenticateUser, createUser } from "../services/user.service";
import type { Result } from "../types/result.types";
import type { SafeUser } from "../types/user.types";
import { createToken } from "../services/auth.service";
import type { ExtendedRequest } from "../types/extended-request.types";

export const signup: RequestHandler = async (req, res): Promise<void> => {
    const data = signupSchema.safeParse(req.body);
    
    if (!data.success) {
        res.status(400).json({ error: getZodErrors(data) });
        return;
    }

    const result: Result<SafeUser> = await createUser(data.data);

    if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
    }

    const token: string = createToken(result.data);

    res.status(201).json({ user: result.data, token });
}

export const signin: RequestHandler = async (req, res): Promise<void> => {
    const data = signinSchema.safeParse(req.body);

    if (!data.success) {
        res.status(400).json({ error: getZodErrors(data) });
        return;
    }

    const result: Result<SafeUser> = await authenticateUser(data.data);

    if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
    }

    const token: string = createToken(result.data);

    res.status(200).json({ user: result.data, token });
}

export const validate = async (req: ExtendedRequest, res: Response): Promise<void> => {
    res.status(200).json({ user: req.user });
}
