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
import { LoggerEvent, SearchParams } from 'sdk-library';
import { eventJoiSchema } from '../models/event';
import { CustomRequest } from '../models/request';
import { UserInternal } from '../models/user';
import { Entity, EntityAction, validateRoute } from '../services/auth-service';
import * as EventService from '../services/event-service';

export const createEvent = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the User
    const user: UserInternal = req.locals.user;

    //  Validate Input
    const validatedBody = Joi.validate(req.body, eventJoiSchema, { convert: true });
    if (validatedBody.error) { throw new Error('Invalid body'); }
    const event: LoggerEvent = validatedBody.value;

    //  Create the Event
    const eventInternal = await EventService.createEvent(event, user);

    //  Return
    res.status(201).send(eventInternal);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const retrieveEvent = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Event, EntityAction.Retrieve, user);

    //  Get the Event ID
    const eventId = req.params.eventId;

    //  Get the Event
    const eventInternal = await EventService.retrieveEvent(eventId, user);

    //  Return the Event
    res.status(200).json(eventInternal);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const searchEvents = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Event, EntityAction.Search, user);

    //  Unpack
    const params: SearchParams = req.body;

    //  Get the Events
    const searchRes = await EventService.searchEvents(params, user);

    //  Return the Events
    res.status(200).json(searchRes);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const updateEvent = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {
    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Event, EntityAction.Search, user);

    //  Get the Event ID
    const eventId = req.params.eventId;

    //  Validate Input
    const validatedBody = Joi.validate(req.body, eventJoiSchema, { convert: true });
    if (validatedBody.error) {
      next('Invalid body');
      return;
    }
    const event: LoggerEvent = validatedBody.value;

    //  Update the Event
    const updatedEvent = await EventService.updateEvent(eventId, event, user);

    //  Return the Event
    res.status(200).json(updatedEvent);
  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};