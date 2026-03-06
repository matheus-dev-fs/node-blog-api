import { v4 } from "uuid";
import type { Result } from "../types/result.types";
import fs from "fs/promises";

export const handleFileUpload = async (file: Express.Multer.File): Promise<Result<string>> => {
    try {
        const allowedMimeTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            const allowedMimeTypesString: string = allowedMimeTypes.join(', ');
            return { success: false, error: `Tipo de arquivo não permitido. Apenas ${allowedMimeTypesString} são aceitos.` };
        }

        const coverName: string = `${v4()}.jpg`;
        await fs.rename(file.path, `./public/images/covers/${coverName}`);
        return { success: true, data: coverName };
    } catch (error) {
        return { success: false, error: "Erro interno no servidor." };
    }
}

export const getCoverUrl = (coverName: string): string => {
    if (!coverName) {
        return '';
    }

    return `${process.env.BASE_URL}/images/covers/${coverName}`;
}