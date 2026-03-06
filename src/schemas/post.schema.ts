import z from 'zod';

export const addPostSchema = z.object({
    title: z.string({ message: "O título é obrigatório." }).min(1, "O título é obrigatório."),
    tags: z.string({ message: "As tags são obrigatórias." }).min(1, "As tags são obrigatórias."),
    body: z.string({ message: "O conteúdo é obrigatório." }).min(1, "O conteúdo é obrigatório."),
});

export const editPostSchema = z.object({
    title: z.string().min(1, "O título é obrigatório.").optional(),
    tags: z.string().min(1, "As tags são obrigatórias.").optional(),
    body: z.string().min(1, "O conteúdo é obrigatório.").optional(),
    status: z.enum(["DRAFT", "PUBLISHED"], { message: "Status inválido. Status deve ser DRAFT ou PUBLISHED." }).optional()
});