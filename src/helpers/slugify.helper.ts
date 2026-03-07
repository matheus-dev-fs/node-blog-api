import slug from "slug";

export const slugify = (title: string): string => {
    return slug(title);
};
