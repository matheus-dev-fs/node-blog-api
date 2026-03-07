import type { Post, Prisma } from "../generated/prisma/client";
import { slugify } from "../helpers/slugify.helper";
import { prisma } from "../libs/prisma.lib";
import type { CreatePostProps, EditPostProps, PostWithAuthor } from "../types/post.types";
import type { Result } from "../types/result.types";

export const getAllPosts = async (page: number, authorId: number): Promise<Result<PostWithAuthor[]>> => {
    try {
        if (page < 1) {
            return { success: false, error: "Número de página inválido." };
        }

        const perPage: number = 5;

        const posts = await prisma.post.findMany({
            where: {
                authorId
            },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: perPage,
            skip: (page - 1) * perPage
        });

        return { success: true, data: posts };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
}

export const getPublishedPosts = async (page: number): Promise<Result<PostWithAuthor[]>> => {
    try {
        if (page < 1) {
            return { success: false, error: "Número de página inválido." };
        }

        const perPage: number = 5;

        const posts = await prisma.post.findMany({
             where: {
                status: "PUBLISHED"
            },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: perPage,
            skip: (page - 1) * perPage
        });

        return { success: true, data: posts };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
};

export const findPostBySlug = async (slug: string): Promise<Result<PostWithAuthor>> => {
    try {
        const post: PostWithAuthor | null = await prisma.post.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!post) {
            return { success: false, error: "Post não encontrado." };
        }

        return { success: true, data: post };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
}

export const createPostSlug = async (title: string): Promise<Result<string>> => {
    try {
        let slug: string = slugify(title);
        let keepTrying: boolean = true;
        let suffix: number = 1;

        while (keepTrying) {
            const existingPost: Result<Post> = await findPostBySlug(slug);

            if (!existingPost.success) {
                keepTrying = false;
            } else {
                slug = `${slugify(title)}-${suffix}`;
                suffix++;
            }
        }

        return { success: true, data: slug };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
};

export const createPost = async ({
    authorId,
    slug,
    title,
    tags,
    body,
    cover
}: CreatePostProps): Promise<Result<Post>> => {
    try {
        const post: Post = await prisma.post.create({
            data: {
                authorId,
                slug,
                title,
                tags,
                body,
                cover
            }
        });

        return { success: true, data: post };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
}

export const updatePost = async (slug: string, data: Prisma.PostUpdateInput): Promise<Result<Post>> => {
    try {
        const post = await prisma.post.update({
            where: { slug },
            data
        });

        return { success: true, data: post };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
}

export const deletePost = async (slug: string): Promise<Result<null>> => {
    try {
        await prisma.post.delete({
            where: { slug }
        });

        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
}