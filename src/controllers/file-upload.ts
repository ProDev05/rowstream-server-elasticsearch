import { Request, Response, NextFunction } from 'express';
import { uploadFile } from '../services/upload-service';

export const uploadFileUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resUrl = await uploadFile(req.file);
    res.status(200).json({ resUrl });
  } catch (error) {
    next(error);
    return;
  }
};
