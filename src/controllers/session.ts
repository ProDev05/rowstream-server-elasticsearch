/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { NextFunction, Response } from 'express';
import * as Joi from 'joi';
import { APIUser, SearchParams, SearchTerm, Session, SessionInternal } from 'sdk-library';
import { conf } from '../config';
import { RepoConfig } from '../models/config';
import { createBaseObject, updateBaseObject } from '../models/object';
import { CustomRequest } from '../models/request';
import { sessionJoiSchema } from '../models/session';
import { UserInternal } from '../models/user';
import { getSessionRepo } from '../repositories';
import { Entity, getAuthSearchTerm, InstanceAction, validateInstance } from '../services/auth-service';
import { searchTeams } from '../services/team-service';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const sessionRepo = getSessionRepo(repoOptions.session);

export const createSession = async (req: CustomRequest, res: Response, next: NextFunction) => {

  //  Validate Input
  const validatedBody = Joi.validate(req.body, sessionJoiSchema, { convert: true });
  if (validatedBody.error) {
    next('Invalid body');
    return;
  }
  const session: Session = validatedBody.value;

  //  Get the User
  const user: UserInternal = req.locals.user;

  //  Check Existing Sessions on the Managed Workout
  //  TODO:  Do not go straight to the repo.
  if (session.workoutId != undefined) {

    const sessions = await sessionRepo.search({
      search: {
        match: {
          workoutId: session.workoutId,
          owner: user.username
        }
      }
    });

    if (sessions.results.length > 0) {
      next('Only one session is permitted per Managed Workout.'); return;
    }
  }

  //  Create the Session
  const baseObj = createBaseObject(user);
  const sessionInternal: SessionInternal = { ...session, ...baseObj };
  await sessionRepo.create(sessionInternal.id, sessionInternal);

  //  Return
  res.status(201).send(sessionInternal);
};

export const retrieveSession = async (req: CustomRequest, res: Response, next: NextFunction) => {

  //  Get the SessionID
  //  TODO:  Validate
  const sessionId = req.params.sessionId;

  //  Get the logged in user
  const user: UserInternal = req.locals.user;

  //  Get the Session
  const sessionInternal = await sessionRepo.retrieve(sessionId);

  //  Validate Ownership
  const hasAccess = await validateInstance(Entity.Session, InstanceAction.Read, user, sessionInternal);
  if (!hasAccess) { next('Unauthorized'); return; }

  //  Return the Session
  res.status(200).json(sessionInternal);
};

/**
 * Returns an array of usernames to which the given user has access.
 * @param user
 */
export const getAuthorizedSessionUsers = async (user: APIUser) => {

    //  Create the Auth Term (Coaches have access)
    const accessList: string[] = [user.username];
    //  TODO-IMPORTANT:  We're opening session data to ALL Team Memebers for the leaderboard.  Reconsider whether we want to do this.  We could instead use a one-off system for Workouts with several users.
    // if (user.roles.indexOf(Role.Coach) != -1) {

      //  Get the Team
      const teams = await searchTeams({}, user);
      if (teams.results.length == 1) {
        const team = teams.results[0];
        accessList.push(...team.players);
      }
    // }

    return accessList;
};

export const searchSessions = async (req: CustomRequest, res: Response, next: NextFunction) => {

  //  Get the logged in user
  const user: UserInternal = req.locals.user;

  //  Unpack Body
  const params: SearchParams = req.body;

  //  Create a Query String with Entitlements

  //  Get Auth Term
  const whitelist = await getAuthorizedSessionUsers(user);
  const authTerm = await getAuthSearchTerm(user, whitelist);

  //  Combine the Search Terms
  const searchTerms: SearchTerm[] = [];
  if (params.search != undefined) { searchTerms.push(params.search); }
  searchTerms.push(authTerm);

  //  Get the Sessions
  //  TODO:  Sanitize the query.
  const searchParams: SearchParams = { ...params, search: { all: searchTerms } };
  const sessionInternalList = await sessionRepo.search(searchParams);

  //  Return the Sessions
  res.status(200).json(sessionInternalList);
};

export const updateSession = async (req: CustomRequest, res: Response, next: NextFunction) => {

  const sessionId = req.params.sessionId;

  //  Validate Input
  const validatedBody = Joi.validate(req.body, sessionJoiSchema, { convert: true });
  if (validatedBody.error) {
    next('Invalid body');
    return;
  }
  const session: Session = validatedBody.value;
  const user: UserInternal = req.locals.user;

  //  Get Existing
  const existingSession = await sessionRepo.retrieve(sessionId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Session, InstanceAction.Write, user, existingSession);
  if (!hasAccess) { next('Unauthorized'); return; }

  //  Update the Session
  const baseObj = updateBaseObject(existingSession);
  const updatedSession = { ...session, ...baseObj };
  await sessionRepo.update(updatedSession.id, updatedSession);

  //  Return the Session
  res.status(200).json(updatedSession);
};
