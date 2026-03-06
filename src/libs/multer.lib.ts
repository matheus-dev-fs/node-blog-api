import multer, { type Multer } from "multer";

export const upload: Multer = multer({
    dest: 'tmp/'
});