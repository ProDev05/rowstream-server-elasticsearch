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
import { generateGUID } from '../util/identity';
import { UserInternal } from './user';
import { APIUser, BaseObject } from 'sdk-library';

export const baseObjectElasticSchema = {
  'created': { 'type': 'date' },
  'updated': { 'type': 'date'  },
  'id': { 'type': 'keyword'  },
  'owner': { 'type': 'keyword'  },
  // 'read': { 'type': 'keyword'  },
  // 'write': { 'type': 'keyword'  }
};

export const baseObjectJoiSchema = Joi.object().keys({
  created: Joi.date().required(),
  updated: Joi.date().required(),
  id: Joi.string().required(),
  owner: Joi.string().required()
});

export const createBaseObject = (user: APIUser) => {
  const timestamp = new Date();
  return {
    owner: user.username,
    created: timestamp,
    updated: timestamp,
    id: generateGUID()
  } as BaseObject;
};

//  TODO:  Support change of owner?
export const updateBaseObject = (baseObj: BaseObject) => {
  const timestamp = new Date();
  return {
    owner: baseObj.owner,
    created: baseObj.created,
    id: baseObj.id,
    updated: timestamp,
    // read: baseObj.read,
    // write: baseObj.write
  };
};

//  TODO:  Deprecate?
export const validateInstanceAccess = (baseObj: BaseObject, user: UserInternal) => {
  if (user.username !== baseObj.owner) {
    throw new Error('Unauthorized Request');
  }
};

// export const validateReadPermission = (baseObj: BaseObject, user: UserInternal) => {
//   if ((user.username !== baseObj.owner) && (baseObj.read.indexOf(user.username) == -1)) {
//     throw new Error('Unauthorized Read Request');
//   }
// };

// export const validateWritePermission = (baseObj: BaseObject, user: UserInternal) => {
//   if ((user.username !== baseObj.owner) && (baseObj.write.indexOf(user.username) == -1)) {
//     throw new Error('Unauthorized Write Request');
//   }
// };