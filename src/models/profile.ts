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

//  TODO:  Split out into several models.
//  TODO:  Extend the BaseObject
export interface Profile {
  name?: string;
  city?: string;
  state?: string;
  avatar?: string;
  username?: string;
  id: string;
}

//  TODO:  Include additional, more current and relevant profile info.
export const profileElasticSchema = {
  'name': { 'type': 'keyword' },
  'city': { 'type': 'keyword'  },
  'state': { 'type': 'keyword'  },
  'avatar': { 'type': 'keyword'  },
  'username': { 'type': 'keyword'  },
  'id': { 'type': 'keyword'  },
};

export const profileJoiSchema = Joi.object().keys({
  name: Joi.string().allow(null),
  city: Joi.string().allow(null),
  state: Joi.string().allow(null),
  avatar: Joi.string().allow(null),
  username: Joi.string(),
  id: Joi.string()
});
