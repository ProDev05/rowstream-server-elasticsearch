/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { Response, NextFunction } from 'express';
import { eventJoiSchema, LoggerEventInternal } from '../models/event';
import { RepoConfig } from '../models/config';
import { conf } from '../config';
import * as Joi from 'joi';
import { CustomRequest } from '../models/request';
import { SearchParams, Role, SessionInternal, LoggerEvent } from 'sdk-library';
import { UserInternal } from '../models/user';
import { createBaseObject, validateInstanceAccess, updateBaseObject } from '../models/object';
import { getAuthorizedSessionUsers } from '../controllers';
import { validateInstance, Entity, InstanceAction } from './auth-service';
import { getEventRepo } from '../repositories/event';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const eventRepo = getEventRepo(repoOptions.event);

export const createEvent = async (event: LoggerEvent, user: UserInternal) => {

  //  Create the Event
  const baseObj = createBaseObject(user);
  const eventInternal: LoggerEventInternal = { ...event, ...baseObj };
  await eventRepo.create(eventInternal.id, eventInternal);

  //  Return
  return eventInternal;
};

export const retrieveEvent = async (eventId: string, user: UserInternal) => {

  //  Get the Event
  const eventInternal = await eventRepo.retrieve(eventId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Event, InstanceAction.Read, user, eventInternal);
  if (!hasAccess) { throw new Error('Unauthorized'); }

  //  Return the Event
  return eventInternal;
};

export const searchEvents = async (params: SearchParams, user: UserInternal) => {

  //  Get the Events
  //  TODO:  Sanitize the query.
  //  TODO:  Eventually use ACL in search instead of post-search for-loop.
  const eventInternalList = await eventRepo.search(params);

  //  Validate Instance Access
  //  TODO:  Fix results count from pagination!  We should be filtering WITHIN the search to avoid extra return values.
  const permissionedEventList: LoggerEventInternal[] = [];
  for (let index = 0; index < eventInternalList.results.length; index++) {
    const event = eventInternalList.results[index];
    const hasAccess = await validateInstance(Entity.Event, InstanceAction.Read, user, event);
    if (hasAccess) {
      permissionedEventList.push(event);
    }
  }

  //  Return the Events
  return { results: permissionedEventList, total: eventInternalList.total };
};

export const updateEvent = async (eventId: string, event: LoggerEvent, user: UserInternal) => {

  //  Get Existing
  const existingEvent = await eventRepo.retrieve(eventId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Event, InstanceAction.Write, user, existingEvent);
  if (!hasAccess) { throw new Error('Unauthorized'); }

  //  Update the Event
  const baseObj = updateBaseObject(existingEvent);
  const updatedEvent = { ...event, ...baseObj };
  await eventRepo.update(updatedEvent.id, updatedEvent);

  //  Return the Event
  return updatedEvent;
};