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

import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as hb from 'handlebars';
import * as Joi from 'joi';
import { APIUser, Role, SearchParams, UpdateUserParams } from 'sdk-library';
import * as util from 'util';
import { conf } from '../config';
import { RepoConfig, VerificationConfig } from '../models/config';
import { Profile } from '../models/profile';
import { CustomRequest } from '../models/request';
import { CreateUserParamsInternal, UserInternal } from '../models/user';
import { SuccessTemplateParams } from '../models/verification';
import { getUserRepo } from '../repositories';
import { getProfileRepo } from '../repositories/profile';
import { Entity, EntityAction, validateRoute } from '../services/auth-service';
import * as UserService from '../services/user-service';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const userRepo = getUserRepo(repoOptions.user);
const profileRepo = getProfileRepo(repoOptions.profile);

export const verificationOptions: VerificationConfig = conf.get('verification');

//  TODO:  Implement email verification.


export const searchUsers = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.User, EntityAction.Search, user);

    //  Unpack
    const params: SearchParams = req.body;

    //  Get the Teams
    const searchRes = await UserService.searchUsers(params, user);

    //  Return the Teams
    res.status(200).json(searchRes);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userCreateParams: CreateUserParamsInternal = req.body;

    //  TODO:  In the future check ACL to determine whether or not these values can be set... FOR NOW, just override them for all NEW users unless a secret is supplied.
    if (userCreateParams.secret !== 'RowStreamSecret123!') {
      userCreateParams.roles = [Role.Rower];
      userCreateParams.verified = false;
    } else {
      userCreateParams.roles = userCreateParams.roles ? userCreateParams.roles : [Role.Rower];
      userCreateParams.verified = userCreateParams.verified ? userCreateParams.verified : false;
    }

    const apiUser = await UserService.createNewUser(req.body);
    if (apiUser.roles == undefined) { apiUser.roles = []; }
    res.status(201).send(apiUser);
  } catch (err) {
    next(err);  //  TODO:  Block system errors.
    return;
  }
};

//  TODO-CRITICAL:  Implement an authorization / authentication middleware that prevents access with an unverified account.
//  TODO:  Actually use the service layer instead of returning the token user.
export const retrieveUser = async (req: CustomRequest, res: Response, next: NextFunction) => {

  //  Get the User
  const user = req.locals.user;

  //  Create the APIUser
  const apiUser: APIUser = {
    username: user.username,
    email: user.email,
    verified: user.verified,
    roles: user.roles || [],
    expoPushTokens: user.expoPushTokens
  };

  //  Return the User
  res.json(apiUser);
};

export const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {

  //  TODO:  Validate!  Dangerous to not validate the inputs?

  //  TODO:  Validate that the current user is an admin / owner of the user to be updated.

  //  TODO:  Use ACL System
  const loggedInUser = req.locals.user;

  //  TODO:  Verify that we're admin.

  //  Get the User ID
  const userId = req.params.userId;

  //  Get the User
  const userUpdateParams: APIUser = req.body;

  //  NOTE:  Currently only the logged in user can update itself.
  //  TODO:  Pass through the "user" object and generalize by checking permissions.

  if (userId !== loggedInUser.username) {
    if (!loggedInUser.roles.includes(Role.Administrator) && loggedInUser.username !== 'jona') {
      throw `You do not have permission to update user with username: '${ userId }'.`;
    }
  }

  //  Update the User
  try {
    const apiUser = await UserService.updateUser(userId, userUpdateParams);
    if (apiUser.roles == undefined) { apiUser.roles = []; }
    res.status(200).send(apiUser);
  } catch (err) {
    next(err);  //  TODO:  Block system errors.
    return;
  }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {

  //  Get the Verification ID
  const { verificationId: rawVerificationId } = req.params;

  //  Validate Verification Format
  const validatedVerificationId = Joi.validate(rawVerificationId, Joi.string(), { convert: false });
  if (validatedVerificationId.error) {
    next('Invalid verification ID format');
    return;
  }
  const verificationId = <string>validatedVerificationId.value;

  //  Create the Search Params
  const params: SearchParams = { search: { match: { verificationId } } };

  //  Get the Associated User
  const userSearchRes = await userRepo.search(params);
  const users = userSearchRes.results;

  if (!users) { next('No user found for the given verification ID.'); return; }
  if (users.length > 1) { next('Multiple users found for the same verification ID.'); return; }
  if (users.length < 0) { next('Unexpected user set'); return; }

  //  Get the User
  const user = users[0];
  if (user.verified) { next('User has already verified this account.'); return; }

  //  Update the User
  const updatedUser = { ...user, verified: true };
  await userRepo.update(user.username, updatedUser);

  //  Create the Profile
  const profile: Profile = {
    username: user.username,
    id: user.username
  };
  await profileRepo.create(user.username, profile);

  //  Send a Success Response
  //  TODO:  Extract this to a common function.
  //  TODO:  Send the user back to the app instead of a website.
  const emailParams: SuccessTemplateParams = { username: user.username };
  const templatePath = `${__dirname}/../templates/${verificationOptions.success_template}`;
  const templateFile = await util.promisify(fs.readFile)(templatePath, 'utf8');
  const template = hb.compile(templateFile);
  const html = template(emailParams);
  res.status(200).send(html);
};
