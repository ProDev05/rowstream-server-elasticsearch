/**
 * Copyright (C) William R. Sullivan - All Rights Reserved
 * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
 */

import { CRUDRepo } from '../crud';
import { ElasticWorkoutRepo } from './elastic-workout-repo';
import { WorkoutInternal } from 'sdk-library';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticWorkoutRepo
};

export const getWorkoutRepo = (repo: string): CRUDRepo<WorkoutInternal> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<WorkoutInternal> = new constructor();
  return repoInst;
};
