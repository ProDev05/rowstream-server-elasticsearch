// /**
//  * Copyright (C) William R. Sullivan - All Rights Reserved
//  * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
//  */

// import { Response, Request, NextFunction } from 'express';
// import { CRUDRepo } from '../repositories';
// import * as Joi from 'joi';
// import { hashUser } from '../models/user';

// export abstract class CRUDController<T> {
//   constructor(protected repo: CRUDRepo<T>, protected idKey: string, protected joiSchema: Joi.Schema) {}
//   public async create(req: Request, res: Response, next: NextFunction): void {

//     //  Validate Input
//     const validatedBody = Joi.validate(req.body, this.joiSchema, { convert: false });
//     if (validatedBody.error) {
//       next('Invalid body');
//       return;
//     }
//     const payload: any = validatedBody.value;

//     //  Get the ID
//     const id = payload[this.idKey];

//     //  Check Existing
//     const existing = await this.repo.retrieve(id);
//     if (existing) { next('A resource with the given id already exists.'); }

//     //  Hash the Password
//     const hashedUser = await hashUser(user);

//     //  Create the User
//     await userRepo.create(username, hashedUser);

//     //  Return
//     res.status(201).json();
//   }

//   public retrieve(req: Request, res: Response, next: NextFunction): void;
//   public search(req: Request, res: Response, next: NextFunction): void;
//   public update(req: Request, res: Response, next: NextFunction): void;
//   public delete(req: Request, res: Response, next: NextFunction): void;
// }
