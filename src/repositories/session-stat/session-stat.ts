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
import { SessionGeneralStatusStatInternal, SessionAdditionalStatus1StatInternal, SessionAdditionalStatus2StatInternal, SessionStrokeDataStatInternal } from 'sdk-library';
import { ElasticGeneralSessionStatRepo, ElasticAdditional2SessionStatRepo, ElasticAdditional1SessionStatRepo, ElasticStrokeDataSessionStatRepo } from './elastic-session-stat-repo';

const generalRepoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticGeneralSessionStatRepo
};

export const getGeneralSessionStatRepo = (repo: string): CRUDRepo<SessionGeneralStatusStatInternal> => {
  const constructor = generalRepoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<SessionGeneralStatusStatInternal> = new constructor();
  return repoInst;
};



const additional1RpoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticAdditional1SessionStatRepo
};

export const getAdditional1SessionStatRepo = (repo: string): CRUDRepo<SessionAdditionalStatus1StatInternal> => {
  const constructor = additional1RpoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<SessionAdditionalStatus1StatInternal> = new constructor();
  return repoInst;
};



const additional2RepoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticAdditional2SessionStatRepo
};

export const getAdditional2SessionStatRepo = (repo: string): CRUDRepo<SessionAdditionalStatus2StatInternal> => {
  const constructor = additional2RepoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<SessionAdditionalStatus2StatInternal> = new constructor();
  return repoInst;
};


const strokeDataRepoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticStrokeDataSessionStatRepo
};

export const getStrokeDataSessionStatRepo = (repo: string): CRUDRepo<SessionStrokeDataStatInternal> => {
  const constructor = strokeDataRepoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const repoInst: CRUDRepo<SessionStrokeDataStatInternal> = new constructor();
  return repoInst;
};
