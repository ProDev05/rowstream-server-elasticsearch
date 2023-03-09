/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { baseObjectElasticSchema } from './object';
import * as Joi from 'joi';
import { searchParamsJoi } from './search-param';

//  Session Stat
export const sessionStatElasticSchema = {
  sessionId: { type: 'keyword' }
};

//  Session Search Metadata
export const sessionSearchMetadataJoi = {
  sessionId: Joi.string().required()
};

export const sessionSearchParamsJoi = Joi.object(searchParamsJoi).keys({
  metadata: sessionSearchMetadataJoi
});

//  General Schema
export const sessionGeneralStatElasticSchema = {
  elapsedTime: { type: 'date' },
  distance: { type: 'double' },
  totalWorkDistance: { type: 'double' },
  workoutType: { type: 'keyword' },
  intervalType: { type: 'keyword' },
  workoutState: { type: 'keyword' },
  rowingState: { type: 'keyword' },
  strokeState: { type: 'keyword' },
  workoutDuration: { type: 'double' },
  workoutDurationType: { type: 'keyword' },
  dragFactor: { type: 'double' },
  ...sessionStatElasticSchema
};

export const sessionGeneralStatInternalElasticSchema = {
  ...sessionGeneralStatElasticSchema,
  ...baseObjectElasticSchema
};

//  Additional1 Schema
export const sessionAdditional1StatElasticSchema = {
  elapsedTime: { type: 'date' },
  speed: { type: 'double' },
  strokeRate: { type: 'double' },
  heartRate: { type: 'double' },
  currentPace: { type: 'date' },
  averagePace: { type: 'date' },
  restDistance: { type: 'double' },
  restTime: { type: 'double' },
  ...sessionStatElasticSchema
};

export const sessionAdditional1StatInternalElasticSchema = {
  ...sessionAdditional1StatElasticSchema,
  ...baseObjectElasticSchema
};

//  Additional2 Schema
export const sessionAdditional2StatElasticSchema = {
  elapsedTime: { type: 'date' },
  intervalCount: { type: 'double' },
  averagePower: { type: 'double' },
  totalCalories: { type: 'double' },
  splitIntAvgPace: { type: 'double' },
  splitIntAvgPower: { type: 'double' },
  splitIntAvgCalories: { type: 'double' },
  lastSplitTime: { type: 'double' },
  lastSplitDistance: { type: 'double' },
  ...sessionStatElasticSchema
};

export const sessionAdditional2StatInternalElasticSchema = {
  ...sessionAdditional2StatElasticSchema,
  ...baseObjectElasticSchema
};

//  Stroke Data Schema
export const sessionStrokeDataStatElasticSchema = {
  elapsedTime: { type: 'date' },
  distance: { type: 'double' },
  driveLength: { type: 'double' },
  driveTime: { type: 'double' },
  strokeRecoveryTime: { type: 'double' },
  strokeDistance: { type: 'double' },
  peakDriveForce: { type: 'double' },
  averageDriveForce: { type: 'double' },
  workPerStroke: { type: 'double' },
  strokeCount: { type: 'double' },
  ...sessionStatElasticSchema
};

export const sessionStrokeDataStatInternalElasticSchema = {
  ...sessionStrokeDataStatElasticSchema,
  ...baseObjectElasticSchema
};

// const sessionGeneralStatJoiProps = {
//   sessionId: Joi.string().required(),
//   elapsedTime: Joi.date().iso().required(),
//   distance: Joi.number().required(),
//   totalWorkDistance: Joi.number().required()
// };
// export const sessionGeneralStatJoiSchema = Joi.object().keys(sessionGeneralStatJoiProps);
// export const sessionGeneralStatInternalJoiSchema = baseObjectJoiSchema.keys(sessionGeneralStatJoiProps);
