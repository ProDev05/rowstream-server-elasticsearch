/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { Response, NextFunction } from 'express';
import * as Joi from 'joi';
import * as JWT from 'jsonwebtoken';
import { UserInternal } from '../models/user';
import { RepoConfig } from '../models/config';
import { conf } from '../config';
import { getUserRepo } from '../repositories';
import { getTokenSecret } from '../models/token';
import { CustomRequest } from '../models/request';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const userRepo = getUserRepo(repoOptions.user);

/**
 * Updates 'req.locals' with an UserInternal object if authenticated.  Otherwise throws an error.
 * @param req
 * @param res
 * @param next
 */
export const tokenMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //  Get the Input
    const rawToken = req.headers['x-access-token'];

    //  Validate Token Format
    const validatedToken = Joi.validate(rawToken, Joi.string(), {
      convert: false,
    });
    if (validatedToken.error) {
      next('Invalid token format');
      return;
    }
    const token = <string>validatedToken.value;

    //  Validate Token
    // console.log(' \n\n--  Printing Request -- ');
    // console.log(JSON.stringify(req.body));
    // console.log(' --  Printed Request -- \n\n');

    const decodedToken: any = JWT.verify(token, getTokenSecret());

    //  Get the User
    //  NOTE:  By pulling the username from the token, it's currently not possible to retrieve other user's information.
    const username = decodedToken.username;
    const user: UserInternal = await userRepo.retrieve(username);
    if (user == undefined) {
      next('User Not Found.');
      return;
    }

    //  Update Locals
    req.locals = { user };
    next();
  } catch (err) {
    next(`Token Auth Failed for Request: Body ${ JSON.stringify(req.body) } Endpoint: ${ req.path }`);
  }
};
