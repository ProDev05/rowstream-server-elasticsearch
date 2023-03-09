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
import { SearchParams, Team } from 'sdk-library';
import { CustomRequest } from '../models/request';
import { teamJoiSchema } from '../models/team';
import { UserInternal } from '../models/user';
import { Entity, EntityAction, validateRoute } from '../services/auth-service';
import * as TeamService from '../services/team-service';

//  TODO:  Use TS Decorators to de-couple controller logic.  This is an example of "Aspect Oriented Programming".
//  REFERENCE:  https://docs.nestjs.com/custom-decorators

export const createTeam = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the User
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Team, EntityAction.Create, user);

    //  Validate Input
    const validatedBody = Joi.validate(req.body, teamJoiSchema, { convert: true });
    if (validatedBody.error) { throw new Error('Invalid body'); }
    const team: Team = validatedBody.value;

    //  Create the Team
    const teamInternal = await TeamService.createTeam(team, user);

    //  Return
    res.status(201).send(teamInternal);

  } catch (err) {
    next(err);
    return;
  }
};

export const retrieveTeam = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Team, EntityAction.Retrieve, user);

    //  Get the Team ID
    const teamId = req.params.teamId;

    //  Get the Team
    const teamInternal = await TeamService.retrieveTeam(teamId, user);

    //  Return the Team
    res.status(200).json(teamInternal);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const searchTeams = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Team, EntityAction.Search, user);

    //  Unpack
    const params: SearchParams = req.body;

    //  Get the Teams
    const searchRes = await TeamService.searchTeams(params, user);

    //  Return the Teams
    res.status(200).json(searchRes);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const updateTeam = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {
    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Team, EntityAction.Search, user);

    //  Get the Team ID
    const teamId = req.params.teamId;

    //  Validate Input
    const validatedBody = Joi.validate(req.body, teamJoiSchema, { convert: true });
    if (validatedBody.error) {
      next('Invalid body');
      return;
    }
    const team: Team = validatedBody.value;

    //  Update the Team
    const updatedTeam = await TeamService.updateTeam(teamId, team, user);

    //  Return the Team
    res.status(200).json(updatedTeam);
  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};