/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

 import { userElasticSchema, UserInternal } from '../../models/user';
import { ElasticRepo } from '../elastic-crud';
import { SearchParams } from 'elasticsearch';
import { elastic } from '../../elastic';
import { conf } from '../../config';
import { ElasticConfig } from '../../models/config';
const Joi = require('joi');

const elasticConf: ElasticConfig = conf.get('elastic');
const { disk_hack: diskHack } = elasticConf;

export class ElasticUserRepo extends ElasticRepo<UserInternal> {
  protected indexName = 'user';
  protected properties = userElasticSchema;
  protected readOnly = diskHack ? false : undefined;
}