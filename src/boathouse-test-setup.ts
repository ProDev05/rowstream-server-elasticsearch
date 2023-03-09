/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { ProfileSDK, Role, Team, TeamSDK, TokenSDK } from 'sdk-library';
import { createUsers } from './util/user';
import { CreateUserParamsInternal } from './models/user';
import { createUsersFromConfig, TeamConfig, UserConfig } from './util/user';

// // const host = 'http://localhost:3000/v0';
// const boathouseNames = ['Test Boathouse I', 'Test Boathouse II'];

// //  Create the SDKs
// const teamSDK = new TeamSDK(host);
// const tokenSDK = new TokenSDK(host);

// const users: CreateUserParamsInternal[][] = [];

// export const generateTestBoathouses = async () => {
//   // Create 10 boathouse test user objects for each boathouse
//   for (let i = 0; i < 2; i++) {
//     users.push([...Array(10).keys()].map(j => {
//       const username = `bh${i + 1}_user${j + 1}`;
//       return {
//           username,
//           email: `${username}@rowstream.com`,
//           password: 'rowstream2021',
//           verified: true,
//           roles: [Role.Rower, Role.Coach]
//         } as CreateUserParamsInternal;
//     }));
//   }

//   // console.log(users);

//   // Create teams and users
//   for (let i = 0; i < 2; i++) {
//     await createUsers(users[i]);
//     //  Create the coach user token
//     const coachToken = (await tokenSDK.create({ username: `bh${i + 1}_user1`, password: 'rowstream2021' })).token;

//     const usernames = users[i].map(user => user.username);
//     const teamParams: Team = { name: boathouseNames[i], players: usernames, invites: [] };
//     const team = await teamSDK.create(teamParams, coachToken);
//   }
//   console.log('Created test user and team');
// };

/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

const host = 'http://localhost:3000/v0';

//  Create the SDKs
const profileSDK = new ProfileSDK(host);

const users: CreateUserParamsInternal[][] = [];

const password = 'rowstream2021';
export const createTestBoathouses = async () => {

  //
  //  Magic Boathouse
  //

  const magicUsers: UserConfig[] = [
    {
      user: {
        username: 'luke',
        email: 'luke@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower],
      },
      profile: {
        name: 'Luke Test',
        city: 'Los Angeles',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
      isTeamOwner: true
    },
    {
      user: {
        username: 'harry',
        email: 'harry@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Rower],
      },
      profile: {
        name: 'Harry Test',
        city: 'Los Angeles',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
    {
      user: {
        username: 'merlin',
        email: 'merlin@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Rower]
      },
      profile: {
        name: 'Merlin Test',
        city: 'Los Angeles',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      }
    },
  ];

  const magicTeamConfig: TeamConfig = {
    name: 'Magic Boathouse',
    avatar:
      'https://images.unsplash.com/photo-1597097273683-22337c365fb7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=932&q=80',
  };

  //  Create the Users
  await createUsersFromConfig(magicUsers, magicTeamConfig);
  console.log('Created the Magic Boathouse');

  //
  //  Irish Boathouse
  //

  const irishUsers: UserConfig[] = [
    {
      user: {
        username: 'liam',
        email: 'liam@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower],
      },
      profile: {
        name: 'Liam Test',
        city: 'Los Angeles',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
      isTeamOwner: true
    },
    {
      user: {
        username: 'galin',
        email: 'galin@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Rower],
      },
      profile: {
        name: 'Galin Test',
        city: 'Los Angeles',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
    {
      user: {
        username: 'pippin',
        email: 'pippin@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Rower],
      },
      profile: {
        name: 'Pippin Test',
        city: 'Los Angeles',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
  ];

  const irishTeamConfig: TeamConfig = {
    name: 'Irish Boathouse',
    avatar:
      'https://images.unsplash.com/photo-1597097273683-22337c365fb7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=932&q=80',
  };

  //  Create the Users
  await createUsersFromConfig(irishUsers, irishTeamConfig);
  console.log('Created the Irish Boathouse');
};

//  start();
