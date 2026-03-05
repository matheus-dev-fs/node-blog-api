import { createJWT, readJWT } from "../libs/jwt.lib";
import type { SafeUser, UserTokenPayload } from "../types/user.types";
import type { Request } from "express";
import { getUserById } from "./user.service";
import type { Result } from "../types/result.types";
import { parsePayloadFromAuthHeader } from "../helpers/auth.helper";

export const createToken = (user: SafeUser): string => {
    return createJWT({
        id: user.id
    });
}

export const verifyRequest = async (req: Request): Promise<Result<SafeUser>> => {
    const payload: Result<UserTokenPayload> = parsePayloadFromAuthHeader(req);

    if (!payload.success) {
        return payload;
    }

    const userId: number = payload.data.id;
    const result: Result<SafeUser> = await getUserById(userId);

    if (!result.success) {
        return { success: false, error: 'Usuário não encontrado.' };
    }

    return { success: true, data: result.data };
} 