/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { Role, Workout, APIUser, TeamInternal, BRStandings } from 'sdk-library';
import { createUsersFromConfig, TeamConfig, UserConfig, getUsersTeam } from './util/user';
import { createWorkout } from './services/workout-service';
import { Profile } from './models/profile';

const password = 'rowstream';

export const createFighterDaveBoathouse = async () => {
  const fighterDaveUsers: UserConfig[] = [
    {
      user: {
        username: 'jona',
        email: 'jon@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower, Role.Member],
      },
      profile: {
        name: 'Jon Andersen',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      }
    },
    {
      user: {
        username: 'chrisb',
        email: 'christopherberl@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower, Role.Member],
      },
      profile: {
        name: 'Chris Berl',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
      isTeamOwner: true,
    },
    {
      user: {
        username: 'liamr',
        email: 'Liamreidvids@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower, Role.Member],
      },
      profile: {
        name: 'Liam Reidvids',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      }
    },
    {
      user: {
        username: 'spencerc',
        email: 's.cutter@me.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Spencer Cutter',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'ransomw',
        email: 'ransomweaver@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Ransom Weaver',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'chapinh',
        email: 'chapinhenry@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Chapin Henry',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'chrisp',
        email: 'chrispedicone@yahoo.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Chris Pedicone',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'mikep',
        email: 'mpeterson@seic.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Mike Peterson',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'chriso',
        email: 'overingc@yahoo.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Chris Overing',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'markw',
        email: 'mark@weglarzco.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Mark Weglarz',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'matth',
        email: 'mphorvat1@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Matt Horvat',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'robm',
        email: 'rmaier@episcopalacademy.org',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Rob Maier',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'stevef',
        email: 'SteveForeman@yahoo.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Steve Foreman',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'billr',
        email: 'Williamjamesreid@live.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Bill Reid',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'edp',
        email: 'epedicone@hotmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Ed Pedicone',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      },
    },

    {
      user: {
        username: 'katiec',
        email: 'cooley.katherine@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Katie Cooley',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
      },
    },

  ];

  const teamConfig: TeamConfig = {
    name: 'Fighter Dave',
    avatar:
      'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
  };

  await createUsersFromConfig(fighterDaveUsers, teamConfig);


    //  Setup a Mock Boathouse Race

    const steve = {
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
    };


    const jon = {
      user: {
        username: 'jona',
        email: 'jon@rowstream.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower, Role.Member],
      },
      profile: {
        name: 'Jon Andersen',
        city: 'Philadelphia',
        state: 'PA',
        avatar:
          'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80',
      }
    };

    const jonTeam: TeamInternal = await getUsersTeam(jon.user as any);
    const steveTeam: TeamInternal = await getUsersTeam(steve.user as any);

    const jonAPIUser: APIUser = {
      username: jon.user.username,
      email: jon.user.email,
      verified: jon.user.verified,
      roles: jon.user.roles,
      expoPushTokens: []
    };

    const jonProfile: Profile = {
      name: 'Jon',
      city: 'Las Angeles',
      state: 'CA',
      avatar: '',
      username: jon.user.username,
      id: jon.user.username
    };

    const steveAPIUser: APIUser = {
      username: steve.user.username,
      email: steve.user.email,
      verified: steve.user.verified,
      roles: steve.user.roles,
      expoPushTokens: []
    };

    const steveProfile: Profile = {
      name: 'Steve',
      city: 'Las Angeles',
      state: 'CA',
      avatar: '',
      username: steve.user.username,
      id: steve.user.username
    };

    const standings: BRStandings = {
      [steveTeam.id]: {
        distance: 1800,
        users: {
          [steve.user.username]: {
            profile: steveProfile,
            user: steveAPIUser,
            distance: 2000,
          }
        },
        boathouse: steveTeam,
        elapsedTime: 2 * 60 * 2000,
        color: '#000000'
      },
      [jonTeam.id]: {
        distance: 2000,
        users: {
          [jon.user.username]: {
            profile: jonProfile,
            user: jonAPIUser,
            distance: 2000,
          }
        },
        boathouse: jonTeam,
        elapsedTime: 2 * 60 * 1000,
        color: '#FFFFFF'
      },

    };

    const workout: Workout = {
      startTime: (new Date()).toISOString(),
      type: 'boathouse-race',
      contestants: [steveTeam.id, jonTeam.id],
      standings: JSON.stringify(standings),
      leaderboard: false,
      distance: 2000,
      name: 'Test Race',
      description: 'Lloyed Miller vs Fighter Dave',
      visibility: 'public'
    };

    const newWorkout = await createWorkout(workout, jonAPIUser);
    console.log(newWorkout);


  console.log('Created the Fighter Dave Boathouse');
};
