/**
 * Copyright (c) 2021 Jonathan Andersen
 * Copyright (c) 2021 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import * as Joi from 'joi';
import { baseObjectJoiSchema, baseObjectElasticSchema } from './object';

export const messageElasticSchema = {
  text: { type: 'text' },
  recipient: { type: 'keyword' },
  recipientType: { type: 'keyword' },
  channel: { type: 'keyword' }
};

export const messageInternalElasticSchema = {
  ...messageElasticSchema,
  ...baseObjectElasticSchema,
};

const messageJoiProps = {
  text: Joi.string(),
  recipient: Joi.string(),
  //  TODO:  Verify the type.
  recipientType: Joi.string(),
  channel: Joi.string()
};
export const messageJoiSchema = Joi.object().keys(messageJoiProps);
export const messageInternalJoiSchema =
  baseObjectJoiSchema.keys(messageJoiProps);
