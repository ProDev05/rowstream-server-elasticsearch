/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as Joi from 'joi';
import { Role, CreateUserParams } from 'sdk-library';

//  TODO:  Add notes to the account creation page.
export const createUserParamsJoi = Joi.object().keys({
  username: Joi.string().required().min(3).max(20).trim(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().required().min(8).max(100).trim(),
  roles: Joi.array().items(Joi.string()),  //  TODO:  Check against Role enum.
  verified: Joi.boolean(),
  secret: Joi.string(),
  expoPushTokens: Joi.array().items(Joi.string())
});

export const updateUserParamsJoi = Joi.object().keys({
  username: Joi.string().optional().min(3).max(20).trim(),
  email: Joi.string().email().optional().trim(),
  roles: Joi.array().optional().items(Joi.string()),  //  TODO:  Check against Role enum.
  verified: Joi.boolean().optional(),
  secret: Joi.string(),
  expoPushTokens: Joi.array().optional().items(Joi.string())
});


//  TODO:  Extend the base object
export interface UserInternal {
  username: string; //  NOTE:  Will be used as the ID, primary key field.
  email: string;
  hash: string;
  verificationId: string;
  verified: boolean;
  id: string;
  roles: Role[];
  expoPushTokens: string[];
}

export const userElasticSchema = {
  'username': { 'type': 'keyword' },
  'email': { 'type': 'keyword' },
  'hash': { 'type': 'keyword' },
  'verificationId': { 'type': 'keyword' },
  'verified': { 'type': 'boolean' },
  'id': { 'type': 'keyword' },
  'roles': { 'type': 'keyword' },
  'expoPushTokens': { 'type': 'keyword' }
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

export type AuthToken = {
  accessToken: string,
  kind: string
};

//  TODO:  Split Profile, User, and Token concepts.
// 'passwordResetToken': { 'type': 'text' },
// 'passwordResetExpires': { 'type': 'date' },
// 'tokens': { 'type': 'text' },


const params: Joi.EmailOptions =  {};

export const hashPassword = async (input: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(input, salt);
  return hash;
};

export const validatePassword = async (password: string, hash: string) => {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
};

//  TODO:  Does this need to be UserInternal?
export const getGravatar = (user: UserInternal, size?: number) => {
  if (!size) {
    size = 200;
  }
  if (!user.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(user.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

//  TODO:  Do away with this once we are using ACL on the Create endpoint... Then transform the input if we're not permissioned to submit certain fields.
//         In other words, let admins submit the create user params any way they'd like, where others will get an error thrown if they try to do something like create an admin account or make an automatically verified account.
export interface CreateUserParamsInternal extends CreateUserParams {
  roles: Role[];
  verified: boolean;
  secret?: string;  //  TODO-IMPORTANT:  Remove this and put the /user route behind the token route.  Then, permission the user to do special things (create Admins / create verified users) only if they are an Admin.
}
