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
import { ElasticMessageRepo } from './elastic-message-repo';
import { MessageInternal } from 'sdk-library';

const repoSelectionToConstructor: { [repo: string]: any } = {
  elastic: ElasticMessageRepo
};

export const getMessageRepo = (repo: string): CRUDRepo<MessageInternal> => {
  const constructor = repoSelectionToConstructor[repo];
  if (!constructor) { throw new Error(`The selected repository is not registered: '${repo}'`); }
  const messageRepo: CRUDRepo<MessageInternal> = new constructor();
  return messageRepo;
};
