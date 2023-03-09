/**
 * Copyright (C) William R. Sullivan - All Rights Reserved
 * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
 */

import { CRUDRepo } from '../crud';
import { ElasticProfileRepo } from './elastic-profile-repo';
import { Profile } from '../../models/profile';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticProfileRepo
};

export const getProfileRepo = (repo: string): CRUDRepo<Profile> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<Profile> = new constructor();
  return repoInst;
};
