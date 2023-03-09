/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

 import { jerseySchema, JerseyInternal } from '../../models/jersey';
import { ElasticRepo } from '../elastic-crud';
import { conf } from '../../config';
import { ElasticConfig } from '../../models/config';

const elasticConf: ElasticConfig = conf.get('elastic');
const { disk_hack: diskHack } = elasticConf;

export class ElasticJerseyRepo extends ElasticRepo<JerseyInternal> {
  protected indexName = 'jersey';
  protected properties = jerseySchema;
  protected readOnly = diskHack ? false : undefined;
}