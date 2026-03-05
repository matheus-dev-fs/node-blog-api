import z from "zod";

export const signupSchema = z.object({
    name: z.string({ message: "Nome é obrigatório" })
        .trim()
        .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
        .max(100, { message: "Nome pode ter no máximo 100 caracteres" }),
    email: z.string({ message: "Email é obrigatório" })
        .email({ message: "Email inválido" })
        .trim()
        .transform((email: string): string => email.toLowerCase()),
    password: z.string({ message: "Senha é obrigatória" })
        .min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
        .max(100, { message: "Senha pode ter no máximo 100 caracteres" })
});