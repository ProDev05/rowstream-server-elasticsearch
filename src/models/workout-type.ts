// /**
//  * Copyright (c) 2019 Jonathan Andersen
//  * Copyright (c) 2019 William R. Sullivan
//  *
//  * This software is proprietary and owned by Jonathan Andersen.
//  *
//  * This software was based on https://github.com/wrsulliv/NodeStarter,
//  * licensed under the MIT license.
//  */

// import * as Joi from 'joi';
// import { baseObjectJoiSchema, baseObjectElasticSchema } from './object';

// //  Elastic Schema
// export const workoutTypeElasticSchema = {
//   'name': { 'type': 'keyword' },
//   'description': { 'type': 'text' },
//   'iconType': { 'type': 'text' },
//   'iconName': { 'type': 'text' },
//   'color': { 'type': 'text' }
// };

// export const workoutTypeInternalElasticSchema = {
//   ...workoutTypeElasticSchema,
//   ...baseObjectElasticSchema
// };

// //  Joi Schemas
// const workoutTypeJoiProps = {
//   name: Joi.string().required(),
//   description: Joi.string(),
//   iconType: Joi.string(),
//   iconName: Joi.string(),
//   color: Joi.string()
// };
// export const workoutTypeJoiSchema = Joi.object().keys(workoutTypeJoiProps);
// export const workoutTypeInternalJoiSchema = baseObjectJoiSchema.keys(workoutTypeJoiProps);
