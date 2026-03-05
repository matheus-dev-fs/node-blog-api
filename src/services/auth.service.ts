import { createJWT } from "../libs/jwt.lib";
import type { SafeUser } from "../types/user.types";

export const createToken = (user: SafeUser): string => {
    return createJWT({
        id: user.id
    });
}