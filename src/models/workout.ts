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
import { join } from 'bluebird';

//  Elastic Schema
export const workoutElasticSchema = {

  //  Type
  // 'type': { 'type': 'keyword' },  //  OPTIONS:  'peer-workout', 'peer-race', 'boathouse-race'

  //  Identity
  'name': { 'type': 'keyword' },
  'description': { 'type': 'text' },

  //  Schedule
  'startTime': { 'type': 'date' },
  'endTime': { 'type': 'date' },  //  QUESTION:  Do we need this?

  //  Visibility (Dependent upon sub-type)
  //  TODO:  Support inter-boathouse P2P events.
  'visibility': { type: 'keyword' }, //  OPTIONS:  'public', 'private'

  //  Content
  'type': { 'type': 'keyword' }, //  OPTIONS:  'broadcast', 'group', 'video', 'race'

  //  Addons
  'leaderboard': { 'type': 'boolean' },

  //  Boathouse Race Contestants
  'contestants': { 'type': 'keyword' },

  'distance': { 'type': 'integer' },
  'standings': { 'type': 'text' }
};

export const workoutInternalElasticSchema = {
  ...workoutElasticSchema,
  ...baseObjectElasticSchema
};

const workoutJoiProps = {

  //  Type
  // type: Joi.string().allow("peer", "boathouse").required(),

  //  Identity
  name: Joi.string().optional(),
  description: Joi.string().optional(),

  //  Schedule
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().optional(),  //  NOTE:  Only applies to P2P Workouts / Races.

  //  Visibility (Dependent upon sub-type)
  visibility: Joi.string().allow('public', 'private').required(),

  //  Content
  type: Joi.string().allow('broadcast', 'group', 'video', 'race').optional(),  //  NOTE:  Only applies to P2P Workouts / Races.

  //  Addons
  leaderboard: Joi.boolean().optional(),  //  NOTE:  Only applies to P2P Workouts / Races.

  //  Boathouse Race Contestants
  contestants: Joi.array().items(Joi.string()).optional(),  //  NOTE:  Only applies to P2P Workouts / Races.

  distance: Joi.number().optional()

};

export const workoutJoiSchema = Joi.object().keys(workoutJoiProps);
export const workoutInternalJoiSchema = baseObjectJoiSchema.keys(workoutJoiProps);
