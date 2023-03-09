/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { Role, SearchParams, Workout, WorkoutInternal, APIUser } from 'sdk-library';
import { conf } from '../config';
import { RepoConfig } from '../models/config';
import { createBaseObject, updateBaseObject } from '../models/object';
import { UserInternal } from '../models/user';
import { Entity, InstanceAction, validateInstance } from './auth-service';
import { getWorkoutRepo } from '../repositories/workout';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const workoutRepo = getWorkoutRepo(repoOptions.workout);

const validateManagedWorkout = (workoutInternal: WorkoutInternal) => {

  //  Validate the Object
  const currentTime = new Date();
  // if (new Date(workoutInternal.startTime).getTime() < currentTime.getTime()) {
  //   throw new Error('Cannot create a managed workout scheduled in the past.');
  // }
  if (new Date(workoutInternal.endTime).getTime() < new Date(workoutInternal.startTime).getTime()) {
    throw new Error('Cannot create a managed workout which ends prior to the start time.');
  }
};

export const createWorkout = async (workout: Workout, user: APIUser) => {

  //  Verify Coach
  // if ((user.roles.indexOf(Role.Coach) == -1) && (user.roles.indexOf(Role.Administrator) == -1)) { throw new Error('Unauthorized:  Only Coaches and Administrators are permitted to create new workouts.'); }

  //  Define the Object
  const baseObj = createBaseObject(user);
  const workoutInternal: WorkoutInternal = { ...workout, ...baseObj };

  //  Validate the Object
  validateManagedWorkout(workoutInternal);

  //  Store the Object
  await workoutRepo.create(workoutInternal.id, workoutInternal);

  //  Return
  return workoutInternal;
};

export const retrieveWorkout = async (workoutId: string, user: APIUser) => {

  //  Get the Workout
  const workoutInternal = await workoutRepo.retrieve(workoutId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Workout, InstanceAction.Read, user, workoutInternal);
  if (!hasAccess) { throw new Error('Unauthorized'); }

  //  Return the Workout
  return workoutInternal;
};

export const searchWorkouts = async (params: SearchParams, user: UserInternal) => {

  //  Get the Workouts
  //  TODO:  Sanitize the query.
  //  TODO:  Eventually use ACL in search instead of post-search for-loop.
  const workoutInternalList = await workoutRepo.search(params);

  //  Validate Instance Access
  //  TODO:  Fix results count from pagination!  We should be filtering WITHIN the search to avoid extra return values.
  const permissionedWorkoutList: WorkoutInternal[] = [];
  for (let index = 0; index < workoutInternalList.results.length; index++) {
    const workout = workoutInternalList.results[index];
    const hasAccess = await validateInstance(Entity.Workout, InstanceAction.Read, user, workout);
    if (hasAccess) {
      permissionedWorkoutList.push(workout);
    }
  }

  //  Return the Workouts
  return { results: permissionedWorkoutList, total: workoutInternalList.total };
};

export const updateWorkout = async (workoutId: string, workout: Workout, user: APIUser) => {

  //  Get Existing
  const existingWorkout = await workoutRepo.retrieve(workoutId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Workout, InstanceAction.Write, user, existingWorkout);
  if (!hasAccess) { throw new Error('Unauthorized'); }

  //  Define the Object
  const baseObj = updateBaseObject(existingWorkout);
  const updatedWorkout = { ...workout, ...baseObj };

  //  Validate the Object
  validateManagedWorkout(updatedWorkout);

  //  Store the Object
  await workoutRepo.update(updatedWorkout.id, updatedWorkout);

  //  Return the Workout
  return updatedWorkout;
};


export const deleteWorkout = async (workoutId: string, user: APIUser) => {

  //  Get Existing
  const existingWorkout = await workoutRepo.retrieve(workoutId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Workout, InstanceAction.Write, user, existingWorkout);
  if (!hasAccess) { throw new Error('Unauthorized'); }

  await workoutRepo.delete(existingWorkout.id);

  return existingWorkout;
};