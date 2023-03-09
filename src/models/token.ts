/**
 * Copyright (C) William R. Sullivan - All Rights Reserved
 * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
 */

import * as Joi from 'joi';
import { conf } from '../config';

//  Get the Token Secret
const tokenSecret = conf.get('token_secret');
if (!tokenSecret) { throw new Error('No token secret was defined'); }

export interface TokenParams {
  username: string;
  password: string;
}

//  TODO:  Centralize username / password Joi types!
export const tokenParamsJoi = Joi.object().keys({
  username: Joi.string().required().min(3).max(20).trim(),
  password: Joi.string().required().min(8).max(100).trim()
});

export const getTokenSecret = () => {
  return tokenSecret;
};