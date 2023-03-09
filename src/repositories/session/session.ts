/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { CRUDRepo } from '../crud';
import { ElasticSessionRepo } from './elastic-session-repo';
import { SessionInternal } from 'sdk-library';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticSessionRepo
};

export const getSessionRepo = (repo: string): CRUDRepo<SessionInternal> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<SessionInternal> = new constructor();
  return repoInst;
};
