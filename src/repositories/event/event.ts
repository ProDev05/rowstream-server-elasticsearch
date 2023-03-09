/**
 * Copyright (C) William R. Sullivan - All Rights Reserved
 * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
 */

import { CRUDRepo } from '../crud';
import { ElasticEventRepo } from './elastic-event-repo';
import { LoggerEventInternal } from '../../models/event';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticEventRepo
};

export const getEventRepo = (repo: string): CRUDRepo<LoggerEventInternal> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<LoggerEventInternal> = new constructor();
  return repoInst;
};
