/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { elastic } from '../src/elastic';
import { InfoParams, CatIndicesParams } from 'elasticsearch';
import { CreateUserParamsInternal } from '../src/models/user';
import { Role, Team, TeamSDK, TokenSDK, ProfileSDK } from 'sdk-library';
import { createUsers } from '../src/app';
import { createUser } from '../src/controllers';

const host = 'https://rowstream.herokuapp.com/v0';

//  Create the SDKs
const teamSDK = new TeamSDK(host);
const tokenSDK = new TokenSDK(host);
const profileSDK = new ProfileSDK(host);

const start = async () => {

  //  UCSD Users
  const ucsdUsers = {
    coach: {
      username: 'jeffc',
      email: 'jeffreycollett@gmail.com',
      password: 'rowstream2019',
      verified: true,
      roles: [Role.Coach, Role.Rower]
    } as CreateUserParamsInternal,
    member: {
      username: 'anthonym',
      email: 'amorrell@ucsd.edu',
      password: 'rowstream2019',
      verified: true,
      roles: [Role.Member, Role.Rower]
    } as CreateUserParamsInternal
  };

  //  Test UCSD Users
  // const ucsdUsers = {
  //   coach: {
  //     username: 'wrsulliv',
  //     email: 'wrsulliv2@rowstream.com',
  //     password: 'rowstream2019',
  //     verified: true,
  //     roles: [Role.Coach, Role.Rower]
  //   } as CreateUserParamsInternal,
  //   member: {
  //     username: 'joeyk',
  //     email: 'wrsulliv3@rowstream.com',
  //     password: 'rowstream2019',
  //     verified: true,
  //     roles: [Role.Member, Role.Rower]
  //   } as CreateUserParamsInternal
  // };

  await createUsers(Object.keys(ucsdUsers).map(key => ((ucsdUsers as any)[key])));

  //  Create the Coach Token
  const coachToken = (await tokenSDK.create({ username: ucsdUsers.coach.username, password: ucsdUsers.coach.password })).token;
  const memberToken = (await tokenSDK.create({ username: ucsdUsers.member.username, password: ucsdUsers.member.password })).token;

  //  Create Profiles
  await profileSDK.create({ name: 'Jeff Collett ', city: 'San Diego', state: 'CA' }, coachToken);
  await profileSDK.create({ name: 'Anthony Morrell', city: 'San Diego', state: 'CA' }, memberToken);

  //  Create Team
  const teamParams: Team = { players: [ucsdUsers.member.username], invites: [] };
  const team = await teamSDK.create(teamParams, coachToken);

  console.log("Created Users");
};

start();
