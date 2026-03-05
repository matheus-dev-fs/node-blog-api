import jwt from "jsonwebtoken";
import type { UserTokenPayload } from "../types/user.types";

export const createJWT = (payload: UserTokenPayload): string => {
    return jwt.sign(
        payload, 
        process.env.JWT_KEY as string, 
        { expiresIn: "1h" }
    );
}