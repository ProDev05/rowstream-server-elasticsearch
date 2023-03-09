/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

'use strict';

import { Response, Request, NextFunction } from 'express';
import { getUserRepo } from '../repositories';
import { validatePassword } from '../models/user';
import { RepoConfig } from '../models/config';
import { conf } from '../config';
import * as Joi from 'joi';
import * as JWT from 'jsonwebtoken';
import { tokenParamsJoi, TokenParams, getTokenSecret } from '../models/token';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const userRepo = getUserRepo(repoOptions.user);

//  TODO:  Move to config and set via env-var on production.

//  TODO:  Read the JWT docs again and decide what key to use to generate the token:  https://www.npmjs.com/package/jsonwebtoken
//  TODO:  Create another type to differentiate from User for logging-in.
//  TODO:  Figure out whether or not password is generally hashed on the client-side.
export const createToken = async (req: Request, res: Response, next: NextFunction) => {

  //  Validate Input
  console.log('req.body:', req.body);
  const validatedBody = Joi.validate(req.body, tokenParamsJoi, { convert: false });
  if (validatedBody.error) {
    next('Invalid body');
    return;
  }
  const params: TokenParams = validatedBody.value;

  //  Convert to Lowercase
  const username = params.username.toLowerCase();

  const user = await userRepo.retrieve(username);
  //  TODO:  Make separate objects for API input, transfer objs, and stored objects.  Stored it should be called "Hash".
  const passIsValid = await validatePassword(params.password, user.hash);
  if (!passIsValid) { next('Incorrect Password.');  return; }

  //  Check Verification Status
  const { verified } = user;
  if (!verified) { next('User is not validated'); return; }

  const secret = getTokenSecret();
  const token = JWT.sign({ username }, secret);

  res.send({ token });
};
