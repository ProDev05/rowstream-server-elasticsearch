/**
 * Copyright (C) William R. Sullivan - All Rights Reserved
 * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
 */

import { UserInternal } from '../../models/user';
import { CRUDRepo } from '../crud';
import { ElasticUserRepo } from './elastic-user-repo';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticUserRepo
};

export const getUserRepo = (repo: string): CRUDRepo<UserInternal> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const userRepo: CRUDRepo<UserInternal> = new constructor();
  return userRepo;
};
