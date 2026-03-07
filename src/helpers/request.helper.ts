import type { ExtendedRequest } from "../types/extended-request.types";
import type { Result } from "../types/result.types";

export const getPageNumber = (request: ExtendedRequest): Result<number> => {
    const page = Number(request.query.page) || 1;
    
    if (isNaN(page) || page < 1) {
        return { success: false, error: "Parâmetro de página inválido." };
    }

    return { success: true, data: page };
}