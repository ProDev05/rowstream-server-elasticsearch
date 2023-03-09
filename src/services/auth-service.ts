/**
 * Copyright (c) 2021 William R. Sullivan
 *
 * This software is proprietary and owned by William R. Sullivan.
 * This software has been licensed to Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { UserInternal } from '../models/user';
import { getAuthorizedSessionUsers } from '../controllers';
import { TeamInternal, Role, SessionInternal, WorkoutInternal, APIUser, MessageInternal } from 'sdk-library';
import { LoggerEventInternal } from '../models/event';
import * as teamService from './team-service';

//  TODO:  Every entity in the system should have entitlement grants... Instead of relying on specialized system knowledge like if Person A has access to X then they have access to Y, we should explicitly update their entitlement to Y when we give them permission to X.
//  FOR NOW:  We will make a separate "permissioned" list which we add the instances to.

//  TODO-NEXT:  Instead of storing the ACL Policy on the Objects themselves, we can use an explicit ACP Entity and get it from there... This will prevent use from iterating ALL the user's objects whenever they want to change policy... I like that much better.  BUT, we may still want instance overrides?
//              In the first case, we needed to support search with AND / OR operators so we'd be able to specify READ permission OR OWNER.  That seemed simple enough.  But, after implementing, I can now see that that wasn't a total fix... It DID clean up a lot of tech debt I've been avoiding with ES though!  Either way, with the new one, we now have a more natural way to combine terms for Ownership, and other Auth things.
//              I like this approach:  Before searching for any entity, we update the search with the permissions set in ACL... The user has access to stuff they own, but ALSO things others have given them access to.  We create an "ANY" clause with those owners listed and do the query... In the past I believe ANY queries still worked on a single term though.

//  NOTE:  The API exposes a transformed set of entities.  In other words, the API doesn't have to expose the same entities we have stored in the backend.  It can be a subset, or an entirely new set.  ACL is on THESE entities, the user facing entities.  It's possible that children follows the ACL policy of their parent.

/**
 * Creates a search term which filters out un-permissioned instances.
 * @param user
 */
export const getAuthSearchTerm = async (
  user: UserInternal,
  whitelist: string[]
) => {
  //  Create the Match Terms
  const accessTerms = whitelist.map((username) => ({
    match: { owner: username },
  }));

  //  Create the Auth Term
  const authTerm = { any: accessTerms };

  return authTerm;
};

//  ACP ROUTE:  Can a method be invoked?
//  ACP INSTANCE:  Can a given instance be written to / read?
//  THEN, if it can, there's the question of WHAT permissions the user has access to.

//  TODO:  Review these!

//  Route ACP:  Role Based
export const aclRoutePolicy = {
  team: {
    create: [Role.Coach, Role.Administrator],
    retrieve: [Role.Coach, Role.Administrator, Role.Rower],
    search: [Role.Coach, Role.Administrator, Role.Rower],
    update: [Role.Coach, Role.Administrator],
    delete: [Role.Coach, Role.Administrator],
  },
  session: {
    create: [Role.Rower, Role.Administrator],
    retrieve: [Role.Coach, Role.Administrator, Role.Rower],
    search: [Role.Coach, Role.Administrator, Role.Rower],
    update: [Role.Rower, Role.Administrator],
    delete: [Role.Rower, Role.Administrator],
  },
  event: {
    create: [Role.Administrator],
    retrieve: [Role.Administrator],
    search: [Role.Administrator],
    update: [Role.Administrator],
    delete: [Role.Administrator],
  },
  workout: {
    create: [Role.Coach, Role.Administrator, Role.Rower, Role.Member],
    retrieve: [Role.Coach, Role.Administrator, Role.Rower, Role.Member],
    search: [Role.Coach, Role.Administrator, Role.Rower, Role.Member],
    update: [Role.Coach, Role.Administrator, Role.Member, Role.Rower],
    delete: [Role.Coach, Role.Administrator, Role.Member, Role.Rower],
  },
  user: {
    create: [Role.Coach, Role.Administrator],
    retrieve: [Role.Coach, Role.Administrator, Role.Rower],
    search: [Role.Coach, Role.Administrator, Role.Rower],
    update: [Role.Coach, Role.Administrator, Role.Rower],
    delete: [Role.Coach, Role.Administrator, Role.Rower],
  },
  message: {
    create: [Role.Coach, Role.Administrator, Role.Member, Role.Rower],
    retrieve: [Role.Coach, Role.Administrator, Role.Member, Role.Rower],
    search: [Role.Coach, Role.Administrator, Role.Member, Role.Rower],
    update: [Role.Coach, Role.Administrator, Role.Member, Role.Rower],
    delete: [Role.Coach, Role.Administrator, Role.Member, Role.Rower],
  },
};

export enum Entity {
  Team = 'team',
  Session = 'session',
  Event = 'event',
  Workout = 'workout',
  User = 'user',
  Message = 'message',
}

export enum EntityAction {
  Create = 'create',
  Retrieve = 'retrieve',
  Search = 'search',
  Update = 'update',
  Delete = 'delete',
}

export enum InstanceAction {
  Read = 'read',
  Write = 'write',
}

//  Instance ACP:  Validation Method
//  TODO:  Instead of read / write methods, create search terms and perform LOCAL search?  This way there is only one set of functions needed for access?  We can still use retrieve, but then we run through a local search algo with the same search API?
export const aclInstancePolicy = {
  team: {
    read: async (team: TeamInternal, user: APIUser) => {
      // if (team.owner == user.username) {
      //   return true;
      // }
      // if (team.players.indexOf(user.username) != -1) {
      //   return true;
      // }
      // if (team.invites.indexOf(user.email) != -1) {
      //   return true;
      // }
      // if (user.roles.indexOf(Role.Administrator) != -1) {
      //   return true;
      // }
      return true;  //  NOTE:  Due to Boathouse Racing requirements, team data is now public!
      //  TODO:  Consider making PRIVATE teams!
      return false;
    },
    write: async (team: TeamInternal, user: APIUser) => {
      if (team.owner == user.username) {
        return true;
      }
      if (team.invites.indexOf(user.email) != -1) {
        return true;
      } //  TODO:  Remove this in the future.
      if (team.players.indexOf(user.username) != -1) {
        return true;
      } //  TODO:  Scope update operations to the subset of connections the user "owns"!
      if (user.roles.indexOf(Role.Administrator) != -1) {
        return true;
      }
      return false;
    },
  },
  session: {
    read: async (session: SessionInternal, user: APIUser) => {
      //  Get Access List
      const accessList = await getAuthorizedSessionUsers(user);

      //  Check Access
      if (accessList.indexOf(session.owner) != -1) {
        return true;
      }
      return false;
    },
    write: async (session: SessionInternal, user: UserInternal) => {
      if (session.owner == user.username) {
        return true;
      }
      return false;
    },
  },
  event: {
    read: (event: LoggerEventInternal, user: UserInternal) => {
      if (user.roles.indexOf(Role.Administrator) != -1) {
        return true;
      }
      return false;
    },
    write: async (event: LoggerEventInternal, user: UserInternal) => {
      if (user.roles.indexOf(Role.Administrator) != -1) {
        return true;
      }
      return false;
    },
  },
  workout: {
    read: (workout: WorkoutInternal, user: UserInternal) => {
      //  TODO:  FOR NOW, we let all users have access to read workouts.  In the future, we'll want to restrict this.
      return true;
      if (workout.owner == user.username) { return true; }
      if (user.roles.includes(Role.Administrator)) { return true; }
      return true;  //  TODO:  Check team designation?
    },
    write: async (workout: WorkoutInternal, user: UserInternal) => {
      //  TODO:  Fix this!  Should ONLY allow access to owners / admins.
      return true;
      if (workout.owner == user.username) { return true; }
      if (user.roles.includes(Role.Administrator)) { return true; }
      //  CONSIDER:  Can other coaches?
      //  CONSIDER:  Group based ACL
      return false;
    },
  },
  user: {
    read: (userToReturn: UserInternal, loggedInUser: UserInternal) => {
      if (loggedInUser.roles.indexOf(Role.Administrator) != -1) {
        return true;
      }
      if (loggedInUser.id === userToReturn.id) {
        return true;
      }
      return false;
    },
    write: async (userToReturn: WorkoutInternal, loggedInUser: UserInternal) => {
      if (loggedInUser.roles.indexOf(Role.Administrator) != -1) { return true; }
      if (loggedInUser.id === userToReturn.id) { return true; }
      return false;
    },
  },
  message: {
    read: async (message: MessageInternal, loggedInUser: UserInternal) => {
      //  Handle User Recipient
      if (message.recipientType === 'user') {
        //  User is the Message Owner
        if (message.owner === loggedInUser.id) {
          return true;
        }

        //  User is a Message Recipient
        if (message.recipient.includes(loggedInUser.id)) {
          return true;
        }
      }

      //  Handle Boathouse Recipient
      else if (message.recipientType === 'boathouse') {
        //  The User's Boathouse is a Message Recipient
        //  TODO-GENERAL:  Again.. this can be expressed declaratively.  As a cross-concern, with a decorator, or fully abstracted from the codebase (as I'm doing in other projects).

        //  Handle Global Channel
        if (message.channel === 'global') {
          return true;
        }

        //  Handle All Other Channels
        try {
          await teamService.retrieveTeam(message.recipient, loggedInUser);
          return true;
        } catch (err) {
          return false;
        }
      }

      //  Handle Invalid Recipient
      else {
        throw `An invalid recipient type was provided for the message: '${message.recipientType}''`;
      }

      //  The User is an Admin
      if (loggedInUser.roles.includes(Role.Administrator)) {
        return true;
      }
      return false;
    },
    write: async (message: MessageInternal, loggedInUser: UserInternal) => {
      if (message.owner === loggedInUser.id) {
        return true;
      }
      if (loggedInUser.roles.includes(Role.Administrator)) {
        return true;
      }
      return false;
    },
  },
};

export const validateRoute = (
  route: Entity,
  action: EntityAction,
  user: UserInternal
) => {
  const authorizedRoles = aclRoutePolicy[route][action];
  if (!authorizedRoles) {
    throw new Error(
      'Failed to determine route access, no registered handler for the given route / action.'
    );
  }
  for (const userRole of user.roles) {
    if (authorizedRoles.indexOf(userRole) != -1) {
      return true;
    }
  }
  throw new Error(
    'Failed to validate the route, the user is not assigned an authorized role.'
  );
};

export const validateInstance = async (
  route: Entity,
  action: InstanceAction,
  user: APIUser,
  inst: any
) => {
  const instACLHandler: any = aclInstancePolicy[route][action]; //  Remove any... not sure why this is giving an error.
  if (!instACLHandler) {
    throw new Error(
      'Failed to determine instance access, no registered handler for the given route / action.'
    );
  }
  return await instACLHandler(inst, user);
};

//  Example of Access
// //  Validate Instance Access
// const hasAccess = await validateInstance(Entity.X, InstanceAction.Read, user, XInternal);
// if (!hasAccess) { next('Unauthorized'); return; }

// //  Limit the Search
// const limitTerm: SearchTerm = { match: { xId: searchParams.metadata.sessionId } };

// //  Combine Terms
// const combinedTerms: SearchTerm[] = [];
// if (searchParams.search !== undefined) { combinedTerms.push(searchParams.search); }
// combinedTerms.push(limitTerm);
