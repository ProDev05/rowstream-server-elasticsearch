/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import * as Joi from 'joi';
import { CreateUserParams, APIUser, Role, UpdateUserParams, SearchParams } from 'sdk-library';
import { createUserParamsJoi, hashPassword, UserInternal, updateUserParamsJoi, CreateUserParamsInternal } from '../models/user';
import { RepoConfig } from '../models/config';
import { conf } from '../config';
import { getUserRepo } from '../repositories';
import { generateGUID } from '../util/identity';
import { createLink } from '../util/links';
import { verificationOptions } from '../controllers';
import * as hb from 'handlebars';
import { VerifyTemplateParams } from '../models/verification';
import * as fs from 'fs';
import * as util from 'util';
import { MailData } from '@sendgrid/helpers/classes/mail';
import { sendEmail } from './email';
import { Entity, InstanceAction, validateInstance } from './auth-service';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const userRepo = getUserRepo(repoOptions.user);

export const createNewUser = async (userParams: CreateUserParamsInternal): Promise<APIUser> => {

  //  Validate Input
  const validatedBody = Joi.validate(userParams, createUserParamsJoi, { convert: false });
  if (validatedBody.error) { throw new Error('User validation failed.'); }
  const params: CreateUserParamsInternal = validatedBody.value;

  //  Unpack Params
  const { username: rawUsername, password, email: rawEmail, verified, roles } = params;

  //  Transform Params:  Convert to Lowercase
  const username = rawUsername.toLowerCase();
  const email = rawEmail.toLowerCase();
  //  Verify Roles

  //  Check Existing
  const existing = await userRepo.retrieve(username);
  if (existing) { throw new Error(`User already exists: ${username}.`); }


  //  Check Existing Email
  const existingEmail = await userRepo.search({ search: { match: { email } } });
  if (existingEmail.total > 0) { throw new Error(`User with the provided email already exists: ${email}.`); }

  //  Hash the Password
  const hash = await hashPassword(password);

  //  Create a Verification ID
  const verificationId = generateGUID();

  //  Create the Internal User Object
  const userInternal: UserInternal = {username, email, hash, verificationId, verified, id: username, roles, expoPushTokens: userParams.expoPushTokens || [] };

  //  Create the User
  await userRepo.create(username, userInternal);

  //  Send the Verification Email
  if (!verified) {
    //  TODO:  Harden this hard-coded link against version changes.
    const url = createLink(`/v0/verify/${verificationId}`);
    const emailParams: VerifyTemplateParams = { username, email, url };
    const templatePath = `${__dirname}/../templates/${verificationOptions.email_template}`;
    const templateFile = await util.promisify(fs.readFile)(templatePath, 'utf8');
    const template = hb.compile(templateFile);
    const html = template(emailParams);
    const mailData: MailData = {
      from: 'verification@domain.com',
      to: email,
      subject: 'Account Verification',
      html
    };
    await sendEmail(mailData);
  }

  //  Return
  const apiUser: APIUser = {
    username: userInternal.username,
    email: userInternal.email,
    verified: userInternal.verified,
    roles: userInternal.roles,
    expoPushTokens: userInternal.expoPushTokens
  };

  return apiUser;
};

export const updateUser = async (username: string, user: APIUser, verified = false): Promise<APIUser> => {

  //  Validate Input
  // const validatedBody = Joi.validate(user, updateUserParamsJoi, { convert: false });
  // if (validatedBody.error) { throw new Error('User validation failed: ' + validatedBody.error); }
  // const params: APIUser = validatedBody.value;

  //  Get Existing
  const existing = await userRepo.retrieve(username);
  if (!existing) { throw `Cannot update a non-existent user: '${ username }'`; }

  //  Unpack Params
  const { email: rawEmail = existing.email, expoPushTokens = existing.expoPushTokens, roles = existing.roles } = user;

  //  Force to Lowercase
  //  TODO:  Do this for Roles too?
  //  TODO:  Do we support multiple email registration?  I don't believe so, so guard against this!
  const email = rawEmail.toLowerCase();

  //  Hash the Password
  // const hash = password ? await hashPassword(password) : existing.hash;

  //  Create the Internal User Object
  const userInternal: UserInternal = { username: existing.username, email, hash: existing.hash, verificationId: existing.verificationId, verified: existing.verified, id: existing.id, roles: roles, expoPushTokens: expoPushTokens };

  //  Create the User
  await userRepo.update(username, userInternal);

  //  Return
  const apiUser: APIUser = {
    username: userInternal.username,
    email: userInternal.email,
    verified: userInternal.verified,
    roles: userInternal.roles,
    expoPushTokens: userInternal.expoPushTokens
  };

  return apiUser;
};

export const retrieveUser = async (username: string): Promise<APIUser | undefined> => {

  //  Get the User
  const user = await userRepo.retrieve(username);
  if (user == undefined) { return undefined; }

  //  Create the APIUser
  const apiUser: APIUser = {
    username: user.username,
    email: user.email,
    verified: user.verified,
    roles: user.roles,
    expoPushTokens: user.expoPushTokens
  };
  return apiUser;
};

export const searchUsers = async (params: SearchParams, user: UserInternal) => {
  //  CONSIDER:  Apply ACL here
  return await userRepo.search(params);
};
