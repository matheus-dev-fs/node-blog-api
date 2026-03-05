import type { User } from "../generated/prisma/client";

export type CreateUserProps = {
    name: string;
    email: string;
    password: string;
}

export type SafeUser = Omit<User, 'password' | 'status'>;

export type UserTokenPayload = {
    id: number;
}