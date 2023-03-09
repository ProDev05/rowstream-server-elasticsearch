import { SearchParams, APIUser } from 'sdk-library';
import { conf } from '../config';
import { RepoConfig } from '../models/config';
import { CreateJerseyPayload, JerseyInternal } from '../models/jersey';
import { getJerseyRepo } from '../repositories/jersey';
import { updateBaseObject } from '../models/object';
import { validateInstance } from './auth-service';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const jerseyRepo = getJerseyRepo(repoOptions.jersey);

export const createJersey = async (id: string, body: CreateJerseyPayload) => {
  await jerseyRepo.create(id, body);
  return {
    success: true,
  };
};

export const retrieveJersey = async (params: SearchParams) => {
  const response = await jerseyRepo.search(params);
  const updatedResults = response.results.filter(result => result.id != undefined);
  return { results: updatedResults, total: response.total };
};

export const matchJersey = async (params: SearchParams) => {
  const response = await jerseyRepo.search(params, true);
  return response;
};

export const updateJersey = async (id: string, params: JerseyInternal) => {
  //  Get Existing
  const existingJersey = await jerseyRepo.retrieve(id);
  const updatedJersey = { ...existingJersey, ...params };

  const response = await jerseyRepo.update(id, updatedJersey);
  return response;
};



export const deleteJersey = async (jerseyId: string, user: APIUser) => {

  //  Get Existing
  const existingJersey = await jerseyRepo.retrieve(jerseyId);

  //  TODO:  Instance Access!

  await jerseyRepo.delete(existingJersey.id);

  return existingJersey;
};