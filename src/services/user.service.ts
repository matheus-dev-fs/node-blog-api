import { prisma } from "../libs/prisma.lib";
import type { CreateUserProps, SafeUser, VerifyUserProps } from "../types/user.types";
import bcrypt from "bcryptjs";
import type { ServiceResult } from "../types/service.types";
import type { User } from "../generated/prisma/client";

export const createUser = async ({ name, email, password }: CreateUserProps): Promise<ServiceResult<SafeUser>> => {
    try {
        const user: User | null = await prisma.user.findFirst({
            where: { email }
        });

        if (user) {
            return { success: false, error: 'Já existe um usuário com esse email.' };
        }

        const hashedPassword: string = await bcrypt.hash(password, 10);

        const { password: _, status: __, ...newUser } = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        return { success: true, data: newUser };
    } catch (error) {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export const verifyUser = async ({ email, password }: VerifyUserProps): Promise<ServiceResult<SafeUser>> => {
    try {
        const user: User | null = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            return { success: false, error: 'Email ou senha inválidos.' };
        }

        const passwordMatch: boolean = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return { success: false, error: 'Email ou senha inválidos.' };
        }

        const { password: _, status: __, ...safeUser } = user;
        
        return { success: true, data: safeUser };
    } catch (error) {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}