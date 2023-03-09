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

const password = 'rowstream2021';
export const createLloydMiller = async () => {
  const j3Users: UserConfig[] = [
    {
      user: {
        username: 'josh',
        email: 'josh.collins@blount.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Josh Collins',
        city: 'Las Angeles',
        state: 'CA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
    {
      user: {
        username: 'david',
        email: 'daw@collinswillmott.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'David Willmott',
        city: 'Memphis',
        state: 'TN',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
    {
      user: {
        username: 'steve',
        email: 'stromsteve@hotmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Steve Strom',
        city: 'Spokane',
        state: 'WA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
      isTeamOwner: true,
    },

    {
      user: {
        username: 'erich',
        email: 'exhamm@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Eric Hamilton',
        city: 'Spokane',
        state: 'WA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'jons',
        email: 'jschoenwald@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Jon Schoenwald',
        city: 'Spokane',
        state: 'WA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },
  ];

  const teamConfig: TeamConfig = {
    name: 'Lloyd Miller Memorial Boathouse',
    avatar:
      'https://images.unsplash.com/photo-1597097273683-22337c365fb7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=932&q=80',
  };

  //  Create the Users
  console.log('Create Loyd Miller Users From Config');
  await createUsersFromConfig(j3Users, teamConfig);

  // //  Update Team
  // const teamResult = await teamRepo.search({});
  // console.log(JSON.stringify(teamResult));

  // //  TODO:  Figure out why the match term isn't working for team name.
  // const team = teamResult.results.find(_team => _team.name === teamConfig.name);
  // if (team) {
  //   await teamRepo.update(team.id, {
  //     ...team,
  //     players: j3Users.map((_user) => _user.user.username),
  //   });
  // }

  console.log('Created the Lloyd Miller Boathouse');
};
