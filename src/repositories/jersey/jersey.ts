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
import { ElasticJerseyRepo } from './elastic-jersey-repo';
import { JerseyInternal } from '../../models/jersey';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticJerseyRepo,
};

export const getJerseyRepo = (repo: string): CRUDRepo<JerseyInternal> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) {
    throw new Error(`The selected repository is not registered: '${repo}'`);
  }
  const jerseyRepo: CRUDRepo<JerseyInternal> = new constructor();
  return jerseyRepo;
};
