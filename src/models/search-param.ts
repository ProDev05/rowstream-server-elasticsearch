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

const matchSearchTermJoi = Joi.object().keys({
  match: Joi.object().required()
});

const allSearchTermJoi = Joi.object().keys({
  all: Joi.array().items(Joi.lazy(() => searchTermJoi).required())
});

const anySearchTermJoi = Joi.object().keys({
  any: Joi.array().items(Joi.lazy(() => searchTermJoi).required())
});

const searchTermJoi = Joi.alternatives().try(matchSearchTermJoi, allSearchTermJoi, anySearchTermJoi);


export const searchParamsJoi = {
  search: searchTermJoi,
  size: Joi.number(),
  from: Joi.number(),
  metadata: Joi.any()
};
