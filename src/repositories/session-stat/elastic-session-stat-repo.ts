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
import { conf } from '../../config';
import { ElasticConfig } from '../../models/config';
import { sessionGeneralStatInternalElasticSchema, sessionAdditional1StatInternalElasticSchema, sessionAdditional2StatInternalElasticSchema, sessionStrokeDataStatInternalElasticSchema } from '../../models/session-stat';
import { SearchParams } from 'elasticsearch';
import { elastic } from '../../elastic';
import { SessionGeneralStatusStatInternal, SessionAdditionalStatus1StatInternal, SessionAdditionalStatus2StatInternal, SessionStrokeDataStatInternal } from 'sdk-library';

const elasticConf: ElasticConfig = conf.get('elastic');
const { disk_hack: diskHack } = elasticConf;

export class ElasticGeneralSessionStatRepo<InternalType> extends ElasticRepo<SessionGeneralStatusStatInternal> {
  protected indexName = 'session-general-stat';
  protected properties = sessionGeneralStatInternalElasticSchema;
  protected readOnly = diskHack ? false : undefined;

  //  TODO:  On a real-time repo like this, 'refresh' should be false!
  protected refresh = true;
}

export class ElasticAdditional1SessionStatRepo extends ElasticRepo<SessionAdditionalStatus1StatInternal> {
  protected indexName = 'session-additional1-stat';
  protected properties = sessionAdditional1StatInternalElasticSchema;
  protected readOnly = diskHack ? false : undefined;

  //  TODO:  On a real-time repo like this, 'refresh' should be false!
  protected refresh = true;
}

export class ElasticAdditional2SessionStatRepo extends ElasticRepo<SessionAdditionalStatus2StatInternal> {
  protected indexName = 'session-additional2-stat';
  protected properties = sessionAdditional2StatInternalElasticSchema;
  protected readOnly = diskHack ? false : undefined;

  //  TODO:  On a real-time repo like this, 'refresh' should be false!
  protected refresh = true;
}

export class ElasticStrokeDataSessionStatRepo extends ElasticRepo<SessionStrokeDataStatInternal> {
  protected indexName = 'session-stroke-data-stat';
  protected properties = sessionStrokeDataStatInternalElasticSchema;
  protected readOnly = diskHack ? false : undefined;

  //  TODO:  On a real-time repo like this, 'refresh' should be false!
  protected refresh = true;
}