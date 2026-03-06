export type CreatePostProps = {
    authorId: number;
    slug: string;
    title: string;
    tags: string;
    body: string;
    cover: string;
};

export type Status = "DRAFT" | "PUBLISHED";

export type EditPostProps = Partial<CreatePostProps> & {
    status?: Status;
    updatedAt: Date;
};