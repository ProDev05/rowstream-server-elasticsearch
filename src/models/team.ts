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
import { baseObjectJoiSchema, baseObjectElasticSchema } from './object';

//  Elastic Schema
export const teamElasticSchema = {
  'name': { 'type': 'text' },
  'avatar_url': { 'type': 'keyword' },
  'players': { 'type': 'keyword' },
  'invites': { 'type': 'keyword' },
  'jerseyKey': { 'type': 'keyword' }
};

export const teamInternalElasticSchema = {
  ...teamElasticSchema,
  ...baseObjectElasticSchema
};

//  Joi Schemas
const teamJoiProps = {
  name: Joi.string(),
  avatar_url: Joi.string(),
  players: Joi.array().items(Joi.string()),
  invites: Joi.array().items(Joi.string().email().trim()),
  jerseyKey: Joi.string()
};
export const teamJoiSchema = Joi.object().keys(teamJoiProps);
export const teamInternalJoiSchema = baseObjectJoiSchema.keys(teamJoiProps);
