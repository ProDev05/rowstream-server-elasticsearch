/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { initApp } from '../src/app';

describe('Users', () => {
  let app: any;

  before(async () => {
    app = await initApp();
    app = 'https://rowstream.herokuapp.com';
  });

  it('should successfully create a user', async () => {
  });
});