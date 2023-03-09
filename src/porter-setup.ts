/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { ProfileSDK, Role, TeamSDK, TokenSDK, TeamInternal, Workout, BRStandings, APIUser } from 'sdk-library';
import { CreateUserParamsInternal } from './models/user';
import { createUsersFromConfig, TeamConfig, UserConfig } from './util/user';
import { getJerseyRepo } from './repositories/jersey';
import { RepoConfig } from './models/config';
import { conf } from './config';
import { getTeamRepo } from './repositories';
import { getUsersTeam } from './util/user';
import { createWorkout } from './services/workout-service';
import { retrieveProfile } from './controllers';
import { Profile } from './models/profile';

const repoOptions: RepoConfig = conf.get('repository');

const jerseyRepo = getJerseyRepo(repoOptions.jersey);
const teamRepo = getTeamRepo(repoOptions.team);

const host = 'http://localhost:3000/v0';

//  Create the SDKs
const teamSDK = new TeamSDK(host);
const tokenSDK = new TokenSDK(host);
const profileSDK = new ProfileSDK(host);

const users: CreateUserParamsInternal[][] = [];

// const generateJerseysIfNeeded = async (teamId: string) => {

//   const jerseys = await jerseyRepo.search({});

// };

const password = 'rowstream2022';
export const createPorter = async () => {
  const j3Users: UserConfig[] = [
    {
      user: {
        username: 'dang',
        email: 'gehn@athletics.gonzaga.edu',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower, Role.Coach],
      },
      profile: {
        name: 'Dan Gehn',
        city: 'Madison',
        state: 'WI',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
      isTeamOwner: true
    },
    {
      user: {
        username: 'duncank',
        email: 'duncan.kennedy@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower, Role.Coach],
      },
      profile: {
        name: 'Duncan Kennedy',
        city: 'Madison',
        state: 'WI',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    }
  ];

  const teamConfig: TeamConfig = {
    name: 'Porter Boathouse',
    avatar:
      'https://uwbadgers.com/images/2018/11/2/130504_WRow_MinnMSU534.jpg',
  };

  //  Create the Users
  console.log('Create Porter Users From Config');
  await createUsersFromConfig(j3Users, teamConfig);

  console.log('Created the Porter Boathouse');
};
