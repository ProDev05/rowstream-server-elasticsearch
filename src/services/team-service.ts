/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { APIUser, SearchParams, Team, TeamInternal } from 'sdk-library';
import { conf } from '../config';
import { RepoConfig } from '../models/config';
import { createBaseObject, updateBaseObject } from '../models/object';
import { UserInternal } from '../models/user';
import { getTeamRepo } from '../repositories';
import { Entity, InstanceAction, validateInstance } from './auth-service';

//  Initialize Repositories
//  TODO:  Inject using Dependency Injection (Nest.js supports this)
const repoOptions: RepoConfig = conf.get('repository');
const teamRepo = getTeamRepo(repoOptions.team);

export const createTeam = async (team: Team, user: APIUser) => {

  //  Validate that this is the Coach's ONLY Team (Consider relaxing in the future)
  const existing = await searchTeams({ search: { match: { owner: user.username } } }, user);
  if (existing.total > 0) { throw new Error('Coaches are currently limited to 1 Team'); }

  //  Create the Team
  const baseObj = createBaseObject(user);
  const teamInternal: TeamInternal = { ...team, ...baseObj };
  await teamRepo.create(teamInternal.id, teamInternal);

  //  Return
  return teamInternal;
};

export const retrieveTeam = async (teamId: string, user: APIUser) => {

  //  Get the Team
  const teamInternal = await teamRepo.retrieve(teamId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Team, InstanceAction.Read, user, teamInternal);
  if (!hasAccess) { throw new Error('Unauthorized'); }

  //  Return the Team
  return teamInternal;
};

export const searchTeams = async (params: SearchParams, user: APIUser) => {

  //  Get the Teams
  //  TODO:  Sanitize the query.
  //  TODO:  Eventually use ACL in search instead of post-search for-loop.
  const teamInternalList = await teamRepo.search(params);

  //  Validate Instance Access
  //  TODO:  Fix results count from pagination!  We should be filtering WITHIN the search to avoid extra return values.
  const permissionedTeamList: TeamInternal[] = [];
  for (let index = 0; index < teamInternalList.results.length; index++) {
    const team = teamInternalList.results[index];
    const hasAccess = await validateInstance(Entity.Team, InstanceAction.Read, user, team);
    if (hasAccess) {
      permissionedTeamList.push(team);
    }
  }

  //  Return the Teams
  //  TODO-GENERAL:  Ensure all search methods return the permissioned list length as the total.
  return { results: permissionedTeamList, total: permissionedTeamList.length };
};

export const updateTeam = async (teamId: string, team: Team, user: UserInternal) => {

  //  Get Existing
  const existingTeam = await teamRepo.retrieve(teamId);

  //  Validate Instance Access
  const hasAccess = await validateInstance(Entity.Team, InstanceAction.Write, user, existingTeam);
  if (!hasAccess) { throw new Error('Unauthorized'); }

  //  Update the Team
  const baseObj = updateBaseObject(existingTeam);
  const updatedTeam = { ...team, ...baseObj };
  await teamRepo.update(updatedTeam.id, updatedTeam);

  //  Return the Team
  return updatedTeam;
};