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
import { CreateUserParamsInternal } from '../src/models/user';
import { createUsers } from '../src/util/user';

// const host = 'https://rowstream.herokuapp.com/v0';

// const host = 'https://ec2-3-143-218-238.us-east-2.compute.amazonaws.com:3000/v0'
const host = 'http://localhost:3000/v0';

//  Create the SDKs
const teamSDK = new TeamSDK(host);
const tokenSDK = new TokenSDK(host);
const profileSDK = new ProfileSDK(host);

const start = async () => {

  //  Jon User
  const jonUser = {
    jon: {
      username: 'jon',
      email: 'jon@rowstream.com',
      password: 'rowstream2019',
      verified: true,
      roles: [Role.Coach, Role.Rower, Role.Administrator]
    } as CreateUserParamsInternal
  };

  await createUsers(Object.keys(jonUser).map(key => ((jonUser as any)[key])));

  //  Create the Coach Token
  const coachToken = (await tokenSDK.create({ username: jonUser.jon.username, password: jonUser.jon.password })).token;

  //  Create Profiles
  await profileSDK.create({ name: 'Jon Andersen ', city: 'Los Angeles', state: 'CA' }, coachToken);

  //  Create Team
  const teamParams: Team = { players: [], invites: [] };
  const team = await teamSDK.create(teamParams, coachToken);

  console.log("Created Jon");
};

start();
