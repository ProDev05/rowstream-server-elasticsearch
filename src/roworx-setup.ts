/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { ProfileSDK, Role, TeamSDK, TokenSDK } from 'sdk-library';
import { CreateUserParamsInternal } from './models/user';
import { createUsersFromConfig, TeamConfig, UserConfig } from './util/user';

const host = 'http://localhost:3000/v0';

//  Create the SDKs
const teamSDK = new TeamSDK(host);
const tokenSDK = new TokenSDK(host);
const profileSDK = new ProfileSDK(host);

const users: CreateUserParamsInternal[][] = [];

const password = 'rowstream';
export const createRoworxBoathouse = async () => {
  const roworxUsers: UserConfig[] = [
    {
      user: {
        username: 'pattio',
        // email: 'patti.ohalloran@gmail.com',
        email: 'pattiohalloran@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Rower, Role.Member],
      },
      profile: {
        name: 'Patti Ohalloran',
        city: 'Long Beach',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
      }
    },
    {
      user: {
        username: 'brianm',
        // email: 'bmaginnis1_1999@yahoo.com',
        email: 'brianmaginnis@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Brian Maginnis',
        city: 'Long Beach',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
    {
      user: {
        username: 'tomo',
        // email: 'okeefe.tom@verizon.net',
        email: 'tomokeefe@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Tom O’Keefe ',
        city: 'Long Beach',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'carolm',
        // email: 'carolinemoyer@comcast.net',
        email: 'carolmoyer@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Carol Moyer',
        city: 'Long Beach',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
      },
    },
    {
      user: {
        username: 'johnc',
        email: 'johncranston@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower, Role.Coach],
      },
      profile: {
        name: 'John Cranston',
        city: 'Long Beach',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
    {
      isTeamOwner: true,
      user: {
        username: 'jackn',
        email: 'powerhousefit@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower, Role.Coach],
      },
      profile: {
        name: 'Jack Nunn',
        city: 'Long Beach',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
  ];

  const teamConfig: TeamConfig = {
    name: 'Roworx',
    avatar:
      'http://roworx.com/wp-content/uploads/2020/07/main-sticker.png',
  };

  //  Create the Users
  await createUsersFromConfig(roworxUsers, teamConfig);

  console.log('Created the Roworx Boathouse');
};

//  start();
