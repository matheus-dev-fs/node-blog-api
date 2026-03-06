import type { RequestHandler, Response } from "express";
import type { ExtendedRequest } from "../types/extended-request.types";
import { addPostSchema } from "../schemas/post.schema";
import { getZodErrors } from "../utils/zod.util";
import { getCoverUrl, handleFileUpload } from "../helpers/uploader.helper";
import type { Result } from "../types/result.types";
import { createPost, createPostSlug } from "../services/post.service";
import type { Post } from "../generated/prisma/client";
import { getUserById } from "../services/user.service";
import type { SafeUser } from "../types/user.types";

export const addPost = async (req: ExtendedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "Acesso não autorizado." });
        return;
    }

    const data = addPostSchema.safeParse(req.body);

    if (!data.success) {
        res.status(400).json({ message: "Dados inválidos.", errors: getZodErrors(data) });
        return;
    }

    if (!req.file) {
        res.status(400).json({ message: "A imagem de capa é obrigatória." });
        return;
    }

    const coverNameResult: Result<string> = await handleFileUpload(req.file);

    if (!coverNameResult.success) {
        res.status(400).json({ message: coverNameResult.error });
        return;
    }

    const slug: Result<string> = await createPostSlug(data.data.title);

    if (!slug.success) {
        res.status(500).json({ message: slug.error });
        return;
    }

    const newPostResult: Result<Post> = await createPost({
        authorId: req.user.id,
        slug: slug.data,
        title: data.data.title,
        tags: data.data.tags,
        body: data.data.body,
        cover: coverNameResult.data
    });

    if (!newPostResult.success) {
        res.status(500).json({ message: newPostResult.error });
        return;
    }

    const authorResult: Result<SafeUser> = await getUserById(newPostResult.data.authorId);

    if (!authorResult.success) {
        res.status(500).json({ message: authorResult.error });
        return;
    }

    const postWithAuthor = {
        id: newPostResult.data.id,
        slug: newPostResult.data.slug,
        title: newPostResult.data.title,
        createAt: newPostResult.data.createdAt,
        cover: getCoverUrl(newPostResult.data.cover),
        tags: newPostResult.data.tags,
        authorName: authorResult.data.name,
    }

    res.status(201).json({ message: "Post criado com sucesso.", post: postWithAuthor });
};

export const getPosts: RequestHandler = async (req, res): Promise<void> => {

}

export const getPost: RequestHandler = async (req, res): Promise<void> => {

}

export const editPost: RequestHandler = async (req, res): Promise<void> => {

}

export const removePost: RequestHandler = async (req, res): Promise<void> => {

}