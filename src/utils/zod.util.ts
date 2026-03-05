import type { ZodSafeParseError } from "zod";

export const getZodErrors = (data: ZodSafeParseError<unknown>): Record<string, string[]> => {
    return data.error.flatten().fieldErrors;
};