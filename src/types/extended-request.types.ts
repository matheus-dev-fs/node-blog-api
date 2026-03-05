import { type Request } from 'express';
import type { SafeUser } from './user.types';

export type ExtendedRequest = Request & {
    user?: SafeUser;
}