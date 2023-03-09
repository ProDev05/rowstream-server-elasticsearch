/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { elastic } from './elastic';
import { InfoParams, CatIndicesParams } from 'elasticsearch';
const readline = require('readline');

//  Set up readline.
//  REFERENCE:  https://nodejs.org/api/readline.html
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export enum ResetType {
  ALL = 'ALL', DOCS = 'DOCS'
}

const resetDocs = async () => {
  //  Get All Indices
  const catParams: CatIndicesParams = { v: true, format: 'json' };
  const indices = await elastic.cat.indices(catParams);

  //  Iterate the List to Delete All Documents
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const indexName = index.index;
    if (indexName === 'user') {
      // Only delete "coach_" users created by the simulator
      await elastic.deleteByQuery(
        {
          index: indexName,
          body: {
            query: {
              bool: { should: [
                  { regexp: { username: 'coach_[0-9]' }},
                  { regexp: { username: 'member_.*' }}
              ]}
            }
          }
        });
    } else {
      await elastic.deleteByQuery({ index: indexName, body: { query: { match_all: {} } } });
    }
  }
};
const resetAll = async () => {
  //  Get All Indices
  const catParams: CatIndicesParams = { v: true, format: 'json' };
  const indices = await elastic.cat.indices(catParams);

  //  Iterate the List to Delete All Indices
  //  NOTE:  Bonsai does not support 'elastic.indices.delete({ index: "_all" });'
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const indexName = index.index;
    await elastic.indices.delete({ index: indexName });
  }
};

const getResetType = () => {
  rl.question(`Delete ALL or just DOCS?`, async (answer: unknown) => {
    rl.close();
    if (answer === 'ALL') {
      return ResetType.ALL;
    } else if (answer === 'DOCS') {
      return ResetType.DOCS;
    } else {
      throw new Error('Cancelled the Operation');
    }
  });
};

export const resetElastic = async (resetType?: ResetType) => {

  //  Get Server Info
  const infoParams: InfoParams = {};
  const info = await elastic.info(infoParams);

  //  Log Elastic Info
  console.log(JSON.stringify(info, undefined, 2));


  const _resetType = resetType || getResetType();

  if (_resetType === ResetType.ALL) {
    await resetAll();
    console.log('Reset Elastic - Docs and Indices (All) ');
  } else if (_resetType === ResetType.DOCS) {
    await resetDocs();
    console.log('Reset Elastic - Docs (Docs)');
  }
};

// resetElastic();
