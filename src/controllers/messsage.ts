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
import { SearchParams, Message } from 'sdk-library';
import { CustomRequest } from '../models/request';
import { messageJoiSchema } from '../models/message';
import { UserInternal } from '../models/user';
import { Entity, EntityAction, validateRoute } from '../services/auth-service';
import * as MessageService from '../services/message-service';

export const createMessage = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the User
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Message, EntityAction.Create, user);

    console.log(JSON.stringify(req.body));
    //  Validate Input
    const validatedBody = Joi.validate(req.body, messageJoiSchema, { convert: true });
    if (validatedBody.error) { throw new Error('Invalid body'); }
    const message: Message = validatedBody.value;

    //  Create the Message
    const messageInternal = await MessageService.createMessage(message, user);

    //  Return
    res.status(201).send(messageInternal);

  } catch (err) {
    next(err);
    return;
  }
};

export const retrieveMessage = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Message, EntityAction.Retrieve, user);

    //  Get the Message ID
    const messageId = req.params.messageId;

    //  Get the Message
    const messageInternal = await MessageService.retrieveMessage(messageId, user);

    //  Return the Message
    res.status(200).json(messageInternal);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const searchMessages = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Message, EntityAction.Search, user);

    //  Unpack
    const params: SearchParams = req.body;

    //  Get the Messages
    const searchRes = await MessageService.searchMessages(params, user);

    //  Return the Messages
    res.status(200).json(searchRes);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const updateMessage = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {
    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Message, EntityAction.Search, user);

    //  Get the Message ID
    const messageId = req.params.messageId;

    //  Validate Input
    const validatedBody = Joi.validate(req.body, messageJoiSchema, { convert: true });
    if (validatedBody.error) {
      next('Invalid body');
      return;
    }
    const message: Message = validatedBody.value;

    //  Update the Message
    const updatedMessage = await MessageService.updateMessage(messageId, message, user);

    //  Return the Message
    res.status(200).json(updatedMessage);
  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};