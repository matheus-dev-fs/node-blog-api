import { prisma } from "../libs/prisma.lib";
import type { AuthenticateUserProps, CreateUserProps, SafeUser } from "../types/user.types";
import bcrypt from "bcryptjs";
import type { Result } from "../types/result.types";
import type { User } from "../generated/prisma/client";

export const createUser = async ({ name, email, password }: CreateUserProps): Promise<Result<SafeUser>> => {
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

export const authenticateUser = async ({ email, password }: AuthenticateUserProps): Promise<Result<SafeUser>> => {
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

        const { password: _, ...safeUser } = user;
        
        return { success: true, data: safeUser };
    } catch (error) {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}

export const getUserById = async (id: number): Promise<Result<SafeUser>> => {
    try {
        const user: User | null = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return { success: false, error: 'Usuário não encontrado.' };
        }

        const { password: _, ...safeUser } = user;

        return { success: true, data: safeUser };
    } catch (error) {
        return { success: false, error: 'Erro interno do servidor.' };
    }
}