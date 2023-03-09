import { UserInternal } from './user';
import { Request } from 'express';

export interface CustomRequest extends Request {
  locals: {
    user: UserInternal
  };
}