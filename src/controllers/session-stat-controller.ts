/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

 //  TODO-CRITICAL-ALL:  Convert from Joi to Yup validation for isomorphic JS.

import { Response, NextFunction } from 'express';
import { UserInternal } from '../models/user';
import { RepoConfig } from '../models/config';
import { conf } from '../config';
import { CustomRequest } from '../models/request';
import { validateInstanceAccess, createBaseObject } from '../models/object';
import { getGeneralSessionStatRepo, getAdditional1SessionStatRepo, getAdditional2SessionStatRepo, getStrokeDataSessionStatRepo } from '../repositories/session-stat';
import { SessionStat, SessionGeneralStatusStat, SessionGeneralStatusStatInternal, SessionAdditionalStatus1Stat, SessionAdditionalStatus1StatInternal, SessionAdditionalStatus2Stat, SessionAdditionalStatus2StatInternal, BucketQueryParamsAPI, BucketQueryReturn, BulkBaseType, BucketQueryParams, SearchParams, SessionSearchMetadata, SearchTerm, SessionStrokeDataStat, SessionStrokeDataStatInternal } from 'sdk-library';
import { getSessionRepo, CRUDRepo } from '../repositories';
import * as Joi from 'joi';
import { sessionSearchParamsJoi } from '../models/session-stat';
import { validateInstance, InstanceAction, Entity } from '../services/auth-service';

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const sessionGeneralStatRepo = getGeneralSessionStatRepo(repoOptions.session_general_stat);
const sessionAdditional1StatRepo = getAdditional1SessionStatRepo(repoOptions.session_additional1_stat);
const sessionAdditional2StatRepo = getAdditional2SessionStatRepo(repoOptions.session_additional2_stat);
const sessionStrokeDataStatRepo = getStrokeDataSessionStatRepo(repoOptions.session_stroke_data_stat);
const sessionRepo = getSessionRepo(repoOptions.session);

interface AnyObj { id: string; [k: string]: any; }
class StatController<Input extends SessionStat, Output extends AnyObj > {

  protected statRepo: CRUDRepo<Output>;

  public createSessionStat = async (req: CustomRequest, res: Response, next: NextFunction) => {

    //  Validate Input
    //  TODO:  Validate / Sanitize Input!

    // const validatedBody = Joi.validate(req.body, this.joiSchema, { convert: true });
    // if (validatedBody.error) {
    //   next('Invalid body');
    //   return;
    // }

    const sessionStat: any = req.body;

    //  Get the User
    const user: UserInternal = req.locals.user;

    //  Get the Session
    const sessionInternal = await sessionRepo.retrieve(sessionStat.sessionId);

    //  Validate Ownership
    const hasAccess = await validateInstance(Entity.Session, InstanceAction.Write, user, sessionInternal);
    if (!hasAccess) { next('Unauthorized'); return; }

    //  Create the SessionStat
    const baseObj = createBaseObject(user);
    const sessionStatInternal: any = { ...sessionStat, ...baseObj };
    await this.statRepo.create(baseObj.id, sessionStatInternal);

    //  Return
    res.status(201).send(sessionStatInternal);
  };

  public  retrieveSessionStat = async (req: CustomRequest, res: Response, next: NextFunction) => {

    //  Get the UserID
    //  TODO:  Validate
    const sessionStatId = req.params.sessionStatId;

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Get the SessionStat
    const sessionStat = await this.statRepo.retrieve(sessionStatId);

    //  Get the Session
    const session = await sessionRepo.retrieve(sessionStat.sessionId);

    //  Validate Instance Access
    const hasAccess = await validateInstance(Entity.Session, InstanceAction.Read, user, session);
    if (!hasAccess) { next('Unauthorized'); return; }

    //  Return the SessionStat
    res.status(200).json(sessionStat);
  };

  public searchSessionStats = async (req: CustomRequest, res: Response, next: NextFunction) => {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Unpack
    const body: SearchParams<SessionSearchMetadata> = req.body;

    //  Validate
    const validatedBody = Joi.validate(req.body, sessionSearchParamsJoi, { convert: true });
    if (validatedBody.error) {
      next('Invalid body');
      return;
    }

    //  Get the Session ID
    const searchParams: SearchParams<SessionSearchMetadata>  = validatedBody.value;

    //  Get the Session
    const sessionInternal = await sessionRepo.retrieve(searchParams.metadata.sessionId);

    //  Validate Instance Access
    //  TODO:  Eventually encapsulate this in the "SessionStat" ACL policy.
    const hasAccess = await validateInstance(Entity.Session, InstanceAction.Read, user, sessionInternal);
    if (!hasAccess) { next('Unauthorized'); return; }

    //  Limit the Search
    const limitTerm: SearchTerm = { match: { sessionId: searchParams.metadata.sessionId } };

    //  Combine Terms
    const combinedTerms: SearchTerm[] = [];
    if (searchParams.search !== undefined) { combinedTerms.push(searchParams.search); }
    combinedTerms.push(limitTerm);

    //  Create Params
    const params: SearchParams = { ...searchParams, search: { all: combinedTerms } };

    //  Get the SessionStat
    const sessionStatInternal = await this.statRepo.search(params);

    //  Return the SessionStat
    res.status(200).json(sessionStatInternal);
  };

  public bucketQuery = async (req: CustomRequest, res: Response, next: NextFunction) => {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Unpack Params
    const { sessionId, bucketFields, interval }: BucketQueryParamsAPI = req.body;

    //  TODO:  Validate Params!

    //  Get the Session
    const sessionInternal = await sessionRepo.retrieve(sessionId);

    //  Validate Ownership
    const hasAccess = await validateInstance(Entity.Session, InstanceAction.Read, user, sessionInternal);
    if (!hasAccess) { next('Unauthorized'); return; }

    //  Get the SessionStat
    const params: BucketQueryParams = {
      and: { sessionId },
      timestampField: 'elapsedTime',
      interval,
      bucketFields
    };
    const bucketRes: BucketQueryReturn[] = await this.statRepo.bucketQuery(params);

    //  Return the SessionStat
    res.status(200).json(bucketRes);
  };

  public createSessionStatsBulk = async (req: CustomRequest, res: Response, next: NextFunction) => {

    //  Get the User
    const user: UserInternal = req.locals.user;

    //  Get the Params
    const sessionStats: Input[] = req.body;
    // @ts-ignore
    const sessionId: string = req.query.parentId;

    //  Get the Session
    const sessionInternal = await sessionRepo.retrieve(sessionId);

    //  Validate Ownership
    const hasAccess = await validateInstance(Entity.Session, InstanceAction.Write, user, sessionInternal);
    if (!hasAccess) { next('Unauthorized'); return; }

    //  Attach the given sessionId to each SessionStat
    const updatedSessionStats: any[] = sessionStats.map((sessionStat: any) => {
      const baseObj = createBaseObject(user);
      const sessionStatInternal = { ...sessionStat, ...baseObj, sessionId };
      return sessionStatInternal;
    });

    //  Create the SessionStat
    await this.statRepo.createBulk(updatedSessionStats);

    //  Return
    res.status(201).send();
  };

  public getSessionStatStatistics = async (req: CustomRequest, res: Response, next: NextFunction) => {

    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  Get the Params
    const { match = {}, fields } = req.body;

    //  Get the Session
    const { sessionId } = match;
    if (sessionId == undefined) {
      next('No session ID provided in the "match" object.');
      return;
    }

    //  Get the Session
    const sessionInternal = await sessionRepo.retrieve(sessionId);

    //  Validate Ownership
    const hasAccess = await validateInstance(Entity.Session, InstanceAction.Read, user, sessionInternal);
    if (!hasAccess) { next('Unauthorized'); return; }

    //  Get the SessionStat
    const sessionStatAggs = await this.statRepo.getStats({ match, fields });

    //  Return the SessionStat Aggregations
    res.status(200).json(sessionStatAggs);
  };
}

//  Create the Stat Controllers
class GeneralStatController extends StatController<SessionGeneralStatusStat, SessionGeneralStatusStatInternal> {
  protected statRepo = sessionGeneralStatRepo;
}
export const generalStatController = new GeneralStatController();


class Additional1StatController extends StatController<SessionAdditionalStatus1Stat, SessionAdditionalStatus1StatInternal> {
  protected statRepo = sessionAdditional1StatRepo;
}
export const additional1StatController = new Additional1StatController();


class Additional2StatController extends StatController<SessionAdditionalStatus2Stat, SessionAdditionalStatus2StatInternal> {
  protected statRepo = sessionAdditional2StatRepo;
}
export const additional2StatController = new Additional2StatController();


class StrokeDataStatController extends StatController<SessionStrokeDataStat, SessionStrokeDataStatInternal> {
  protected statRepo = sessionStrokeDataStatRepo;
}
export const strokeDataStatController = new StrokeDataStatController();
