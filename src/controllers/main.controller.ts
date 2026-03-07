import type { RequestHandler } from "express"
import type { Result } from "../types/result.types";
import { getPageNumber } from "../helpers/request.helper";
import type { PostWithAuthor } from "../types/post.types";
import { getPublishedPosts } from "../services/post.service";
import { getCoverUrl } from "../helpers/uploader.helper";

export const getAllPosts: RequestHandler = async (req, res): Promise<void> => {
    const pageResult: Result<number> = getPageNumber(req);

    if (!pageResult.success) {
        res.status(400).json({ message: pageResult.error });
        return;
    }

    const postsResult: Result<PostWithAuthor[]> = await getPublishedPosts(pageResult.data);

    if (!postsResult.success) {
        res.status(500).json({ message: postsResult.error });
        return;
    }

    const postsToReturn = postsResult.data.map((post: PostWithAuthor) => ({
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        cover: getCoverUrl(post.cover),
        authorName: post.author?.name,
        tags: post.tags,
        slug: post.slug,
    }));

    res.status(200).json({ posts: postsToReturn, page: pageResult.data });
}

export const getPost: RequestHandler = async (req, res): Promise<void> => {

}

export const getRelatedPosts: RequestHandler = async (req, res): Promise<void> => {

}