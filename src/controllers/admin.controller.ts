import type { RequestHandler, Response } from "express";
import type { ExtendedRequest } from "../types/extended-request.types";
import { addPostSchema, editPostSchema } from "../schemas/post.schema";
import { getZodErrors } from "../utils/zod.util";
import { getCoverUrl, handleFileUpload } from "../helpers/uploader.helper";
import type { Result } from "../types/result.types";
import { createPost, createPostSlug, deletePost, findPostBySlug, updatePost } from "../services/post.service";
import type { Post, Prisma } from "../generated/prisma/client";
import { getSlugFromRequest } from "../helpers/slugify.helper";

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

    const slugResult: Result<string> = await createPostSlug(data.data.title);

    if (!slugResult.success) {
        res.status(500).json({ message: slugResult.error });
        return;
    }

    const newPostResult: Result<Post> = await createPost({
        authorId: req.user.id,
        slug: slugResult.data,
        title: data.data.title,
        tags: data.data.tags,
        body: data.data.body,
        cover: coverNameResult.data
    });

    if (!newPostResult.success) {
        res.status(500).json({ message: newPostResult.error });
        return;
    }

    const postWithAuthor = {
        id: newPostResult.data.id,
        slug: newPostResult.data.slug,
        title: newPostResult.data.title,
        createAt: newPostResult.data.createdAt,
        cover: getCoverUrl(newPostResult.data.cover),
        tags: newPostResult.data.tags,
        authorName: req.user.name,
    }

    res.status(201).json({ message: "Post criado com sucesso.", post: postWithAuthor });
};

export const getPosts: RequestHandler = async (req, res): Promise<void> => {

}

export const getPost: RequestHandler = async (req, res): Promise<void> => {

}

export const editPost = async (req: ExtendedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "Acesso não autorizado." });
        return;
    }

    const slugResult: Result<string> = getSlugFromRequest(req);

    if (!slugResult.success) {
        res.status(400).json({ message: slugResult.error });
        return;
    }

    const data = editPostSchema.safeParse(req.body);

    if (!data.success) {
        res.status(400).json({ message: "Dados inválidos.", errors: getZodErrors(data) });
        return;
    }

    const postResult: Result<Post> = await findPostBySlug(slugResult.data);

    if (!postResult.success) {
        res.status(404).json({ message: postResult.error });
        return;
    }

    if (postResult.data.authorId !== req.user.id) {
        res.status(403).json({ message: "Você não tem permissão para editar este post." });
        return;
    }

    let coverNameResult: Result<string> | null = null;
    if (req.file) {
        coverNameResult = await handleFileUpload(req.file);

        if (!coverNameResult.success) {
            res.status(400).json({ message: coverNameResult.error });
            return;
        }
    }

    const updateData: Prisma.PostUpdateInput = {
        updatedAt: new Date(),
        ...(data.data.status && { status: data.data.status }),
        ...(data.data.title && { title: data.data.title }),
        ...(data.data.tags && { tags: data.data.tags }),
        ...(data.data.body && { body: data.data.body }),
        ...(coverNameResult?.data && { cover: coverNameResult.data }),
    };

    const updatedPostResult: Result<Post> = await updatePost(slugResult.data, updateData);

    if (!updatedPostResult.success) {
        res.status(500).json({ message: updatedPostResult.error });
        return;
    }

    const postWithAuthor = {
        id: updatedPostResult.data.id,              
        status: updatedPostResult.data.status,
        slug: updatedPostResult.data.slug,
        title: updatedPostResult.data.title,
        createAt: updatedPostResult.data.createdAt,
        updated: updatedPostResult.data.updatedAt,
        cover: getCoverUrl(updatedPostResult.data.cover),
        tags: updatedPostResult.data.tags,
        authorName: req.user.name,
    }

    res.status(200).json({ message: "Post atualizado com sucesso.", post: postWithAuthor });

}

export const removePost = async (req: ExtendedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "Acesso não autorizado." });
        return;
    }

    const slugResult: Result<string> = getSlugFromRequest(req);

    if (!slugResult.success) {
        res.status(400).json({ message: slugResult.error });
        return;
    }

    const postResult: Result<Post> = await findPostBySlug(slugResult.data);

    if (!postResult.success) {
        res.status(404).json({ message: postResult.error });
        return;
    }

    if (postResult.data.authorId !== req.user.id) {
        res.status(403).json({ message: "Você não tem permissão para remover este post." });
        return;
    }

    const deleteResult: Result<null> = await deletePost(slugResult.data);

    if (!deleteResult.success) {
        res.status(500).json({ message: deleteResult.error });
        return;
    }

    res.status(200).json({ message: "Post removido com sucesso." });
}