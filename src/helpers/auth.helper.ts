import type { Request } from "express";
import { readJWT } from "../libs/jwt.lib";
import type { UserTokenPayload } from "../types/user.types";
import type { Result } from "../types/result.types";

export const parsePayloadFromAuthHeader = (req: Request): Result<UserTokenPayload> => {
    const { authorization } = req.headers;

    if (!authorization) {
        return { success: false, error: 'Token de autenticação não fornecido.' };
    }

    const token = authorization.split("Bearer ")[1];

    if (!token) {
        return { success: false, error: 'Token de autenticação inválido.' };
    }

    const payload: UserTokenPayload | false = readJWT(token);

    if (!payload) {
        return { success: false, error: 'Acesso não autorizado.' };
    }

    return { success: true, data: payload };
}