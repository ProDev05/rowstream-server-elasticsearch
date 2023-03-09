/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { ElasticRepo } from '../elastic-crud';
import { Profile, profileElasticSchema } from '../../models/profile';
import { conf } from '../../config';
import { ElasticConfig } from '../../models/config';

const elasticConf: ElasticConfig = conf.get('elastic');
const { disk_hack: diskHack } = elasticConf;

export class ElasticProfileRepo extends ElasticRepo<Profile> {
  protected indexName = 'profile';
  protected properties = profileElasticSchema;
  protected readOnly = diskHack ? false : undefined;
}