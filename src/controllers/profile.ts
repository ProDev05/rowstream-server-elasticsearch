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

import { Response, NextFunction } from 'express';
import { UserInternal } from '../models/user';
import { RepoConfig } from '../models/config';
import { conf } from '../config';
import * as Joi from 'joi';
import { profileJoiSchema, Profile } from '../models/profile';
import { CustomRequest } from '../models/request';
import { getProfileRepo } from '../repositories/profile';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const profileRepo = getProfileRepo(repoOptions.profile);

export const createProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {
    //  Validate Input
    const validatedBody = Joi.validate(req.body, profileJoiSchema, { convert: false });
    if (validatedBody.error) {
      next('Invalid body');
      return;
    }
    const profile: Profile = validatedBody.value;
    const user: UserInternal = req.locals.user;

    //  Create the User
    const updatedProfile = { ...profile, username: user.username };
    await profileRepo.create(user.username, updatedProfile);

    //  Return
    res.status(201).send(updatedProfile);
  } catch (err) {
    next(err);  //  TODO:  Hide System Errors
    return;
  }
};

export const retrieveProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {

  //  NOTE:  Sent param is not currently used.
  //  TODO:  Enable searching / lookup of friended users or ALL users if admin.

  //  Get the UserID
  const { profileId } = req.params;

  //  Get the logged in user
  const user: UserInternal = req.locals.user;

  //  Get the Profile
  const profile = await profileRepo.retrieve(profileId ? profileId : user.username);

  //  Return the Profile
  res.json(profile);
};

export const updateProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {

  //  TODO:  Get profile ID from param.  Currently using the username in the token.

  //  Validate Input
  const validatedBody = Joi.validate(req.body, profileJoiSchema, { convert: false });
  if (validatedBody.error) {
    next('Invalid body');
    return;
  }
  const profile: Profile = validatedBody.value;
  const user: UserInternal = req.locals.user;

  //  Update the Profile
  //  TODO:  Use BaseObject!
  const updatedProfile = { ...profile, username: user.username };
  await profileRepo.update(user.username, updatedProfile);

  //  Return the Profile
  res.json(updatedProfile);
};

