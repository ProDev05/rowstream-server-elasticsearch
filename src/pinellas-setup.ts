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

const password = 'rowstream2021';
export const createPinellasBoathouse = async () => {
  const pinellasUsers: UserConfig[] = [
    {
      user: {
        username: 'justin',
        email: 'pcsofitness@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower],
      },
      profile: {
        name: 'Justin Walsh',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
      isTeamOwner: true
    },
    {
      user: {
        username: 'nick',
        email: 'Ncorrado@knights.ucf.edu',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Nick',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'mark',
        email: 'Iremon@msn.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Mark',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'kris',
        email: 'Kristin.ellis6@icloud.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Kris',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'sofie',
        email: 'Wester_Sofie@hotmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Sofie',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'mike',
        email: 'mikecoz1981@aol.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Mike',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'lorraine',
        email: 'lomarie10@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Lorraine',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'nicki',
        email: 'Nicki.sommer@oracle.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Nicki',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'nicole',
        email: 'nicmcg04@yahoo.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Nicole',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'steph',
        email: 'Sal.abrams@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Steph',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'kathleen',
        email: 'Kkatrh@aol.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Kathleen',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'rachael',
        email: 'rmaresh@sbcglobal.net',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Rachael Maresh',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'nancy',
        email: 'nancy.copenhaver@outlook.com',
        password: password,
        verified: true,
        roles: [Role.Member, Role.Rower],
      },
      profile: {
        name: 'Nancy Copenhaver',
        city: 'Largo',
        state: 'FL',
        avatar:
          'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
      },
    },
    {
      user: {
        username: 'jonathan',
        email: 'jonandersen19@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower]
      },
      profile: {
        name: 'Jon Andersen',
        city: 'Los Angeles',
        state: 'CA',
        avatar: 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80'
      }
    },
    {
      user: {
        username: 'william',
        email: 'wrsulliv@gmail.com',
        password: password,
        verified: true,
        roles: [Role.Coach, Role.Rower]
      },
      profile: {
        name: 'Will Sullivan',
        city: 'Los Angeles',
        state: 'CA',
        avatar: 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80'
      }
    },
  ];

  const teamConfig: TeamConfig = {
    name: 'Pinellas Boathouse',
    avatar:
      'https://scontent-lga3-2.xx.fbcdn.net/v/t1.6435-9/42744678_270982203436865_5975395515670462464_n.jpg?_nc_cat=108&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=7YPPnuetMTgAX8yk9N3&_nc_oc=AQmtr6JwR4iE3xp4wrvWPu3KzBU1WhfeN3Joo8YHA1H3feOGnO5t__PWMvejMYg9W3w&_nc_ht=scontent-lga3-2.xx&oh=ad8bcaca5ec146fbb31ff21e0e3a4ac1&oe=61B1187D',
  };

  //  Create the Users
  await createUsersFromConfig(pinellasUsers, teamConfig);

  console.log('Created the Pinellas Boathouse');
};

//  start();
