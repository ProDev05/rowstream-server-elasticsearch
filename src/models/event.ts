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
import { BaseObject, LoggerEvent } from 'sdk-library';
import { baseObjectElasticSchema } from './object';

export interface LoggerEventInternal extends BaseObject, LoggerEvent {}

export const eventElasticSchema = {
  'user': { 'type': 'keyword' },
  'name': { 'type': 'keyword' },
  'description': { 'type': 'text' },
  'meta': { 'type': 'object' },
  'type': { 'type': 'keyword' },
};

export const eventElasticSchemaInternal = {
  ...eventElasticSchema,
  ...baseObjectElasticSchema
};

export const eventJoiSchema = Joi.object().keys({
  user: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(null),
  meta: Joi.object(),
  type: Joi.string().required()
});
