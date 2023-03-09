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
import { ElasticTeamRepo } from './elastic-team-repo';
import { TeamInternal } from 'sdk-library';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticTeamRepo
};

export const getTeamRepo = (repo: string): CRUDRepo<TeamInternal> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const teamRepo: CRUDRepo<TeamInternal> = new constructor();
  return teamRepo;
};
