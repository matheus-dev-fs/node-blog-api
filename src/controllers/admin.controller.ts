import type { Response } from "express";
import type { ExtendedRequest } from "../types/extended-request.types";
import { addPostSchema, editPostSchema } from "../schemas/post.schema";
import { getZodErrors } from "../utils/zod.util";
import { getCoverUrl, handleFileUpload } from "../helpers/uploader.helper";
import type { Result } from "../types/result.types";
import { createPost, createPostSlug, deletePost, findPostBySlug, getAllPosts, updatePost } from "../services/post.service";
import type { Post, Prisma } from "../generated/prisma/client";
import type { PostWithAuthor } from "../types/post.types";
import { getPageNumber, getSlugFromRequest } from "../helpers/request.helper";

export const getPosts = async (req: ExtendedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "Acesso não autorizado." });
        return;
    }

    const pageResult: Result<number> = getPageNumber(req);

    if (!pageResult.success) {
        res.status(400).json({ message: pageResult.error });
        return;
    }

    const postsResult: Result<PostWithAuthor[]> = await getAllPosts(pageResult.data, req.user.id);

    if (!postsResult.success) {
        res.status(500).json({ message: postsResult.error });
        return;
    }

    const postsToReturn = postsResult.data.map((post: PostWithAuthor) => ({
        id: post.id,
        status: post.status,
        title: post.title,
        createdAt: post.createdAt,
        cover: getCoverUrl(post.cover),
        authorName: post.author?.name,
        tags: post.tags,
        slug: post.slug,
    }));

    res.status(200).json({ posts: postsToReturn });
}

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
        createdAt: newPostResult.data.createdAt,
        cover: getCoverUrl(newPostResult.data.cover),
        tags: newPostResult.data.tags,
        authorName: req.user.name,
    }

    res.status(201).json({ message: "Post criado com sucesso.", post: postWithAuthor });
};

export const getPost = async (req: ExtendedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "Acesso não autorizado." });
        return;
    }

    const slugResult: Result<string> = getSlugFromRequest(req);

    if (!slugResult.success) {
        res.status(400).json({ message: slugResult.error });
        return;
    }

    const postResult: Result<PostWithAuthor> = await findPostBySlug(slugResult.data);

    if (!postResult.success) {
        res.status(404).json({ message: postResult.error });
        return;
    }

    if (postResult.data.authorId !== req.user.id) {
        res.status(403).json({ message: "Você não tem permissão para acessar este post." });
        return;
    }

    const postToReturn = {
        id: postResult.data.id,
        title: postResult.data.title,
        createdAt: postResult.data.createdAt,
        cover: getCoverUrl(postResult.data.cover),
        author: postResult.data.author?.name,
        tags: postResult.data.tags,
        body: postResult.data.body,
        slug: postResult.data.slug,
    }

    res.status(200).json({ post: postToReturn });
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

    const postResult: Result<PostWithAuthor> = await findPostBySlug(slugResult.data);

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
        createdt: updatedPostResult.data.createdAt,
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

    const postResult: Result<PostWithAuthor> = await findPostBySlug(slugResult.data);

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