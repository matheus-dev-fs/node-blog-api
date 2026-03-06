import slug from "slug";
import type { ExtendedRequest } from "../types/extended-request.types";
import type { Result } from "../types/result.types";

export const slugify = (title: string): string => {
    return slug(title);
};

export const getSlugFromRequest = (req: ExtendedRequest): Result<string> => {
    const { slug } = req.params;

    if (!slug || typeof slug !== "string") {
        return { success: false, error: "Slug inválido." };
    }

    return { success: true, data: slug };
}