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

//  TODO:  Deal with session pausing.  FOR NOW, do not support pausing!

export const sessionElasticSchema = {
  'start': { 'type': 'date' },
  'end': { 'type': 'date'  },
  'workoutId': { 'type': 'keyword'  }
};

export const sessionInternalElasticSchema = {
  ...sessionElasticSchema,
  ...baseObjectElasticSchema
};

const sessionJoiProps = {
  start: Joi.date().iso().required(),
  end: Joi.date().iso(),
  workoutId: Joi.string()
};
export const sessionJoiSchema = Joi.object().keys(sessionJoiProps);
export const sessionInternalJoiSchema = baseObjectJoiSchema.keys(sessionJoiProps);
