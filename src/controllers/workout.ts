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
import { Workout, SearchParams } from 'sdk-library';
import { CustomRequest } from '../models/request';
import { workoutJoiSchema } from '../models/workout';
import { UserInternal } from '../models/user';
import { Entity, EntityAction, validateRoute } from '../services/auth-service';
import * as WorkoutService from '../services/workout-service';

export const createWorkout = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the User
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    //  TODO:  Move to decorator?
    validateRoute(Entity.Workout, EntityAction.Create, user);

    //  Validate Input
    const validatedBody = Joi.validate(req.body, workoutJoiSchema, { convert: true });
    if (validatedBody.error) { throw new Error('Invalid body: ' + validatedBody.error); }
    const workout: Workout = validatedBody.value;

    //  Create the workout
    const workoutInternal = await WorkoutService.createWorkout(workout, user);

    //  Return
    res.status(201).send(workoutInternal);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const retrieveworkout = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Workout, EntityAction.Retrieve, user);

    //  Get the workout ID
    const workoutId = req.params.workoutId;

    //  Get the workout
    const workoutInternal = await WorkoutService.retrieveWorkout(workoutId, user);

    //  Return the workout
    res.status(200).json(workoutInternal);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const searchworkouts = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Workout, EntityAction.Search, user);

    //  Unpack
    const params: SearchParams = req.body;

    //  Get the workouts
    const searchRes = await WorkoutService.searchWorkouts(params, user);

    //  Return the workouts
    res.status(200).json(searchRes);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};

export const updateworkout = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {
    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Workout, EntityAction.Search, user);

    //  Get the workout ID
    const workoutId = req.params.workoutId;

    //  Validate Input
    const validatedBody = Joi.validate(req.body, workoutJoiSchema, { convert: true });
    if (validatedBody.error) {
      next('Invalid body');
      return;
    }
    const workout: Workout = validatedBody.value;

    //  Update the workout
    const updatedworkout = await WorkoutService.updateWorkout(workoutId, workout, user);

    //  Return the workout
    res.status(200).json(updatedworkout);
  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
    return;
  }
};


export const deleteWorkout = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {
    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Validate Route Access
    validateRoute(Entity.Workout, EntityAction.Search, user);

    //  Get the workout ID
    const workoutId = req.params.workoutId;

    //  Delete the workout
    const deletedWorkout = await WorkoutService.deleteWorkout(workoutId, user);

    //  Return the workout
    res.status(200).json(deletedWorkout);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
  }
};