/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

 import { AggParams, AggResult, BucketQueryReturn, BulkBaseType, BucketQueryParams, SearchResult, SearchParams } from 'sdk-library';

export abstract class CRUDRepo<Type extends BulkBaseType> {
  //  TODO:  Switch the order of id and payload to make id optional on create.
  public abstract create(id: string, payload: Type): Promise<void>;
  //  TODO:  Consider adding return type, especially for errors on Bulk create.
  public abstract async createBulk(payloadList: Type[]): Promise<void>;
  public abstract async getStats(params: AggParams): Promise<AggResult>;
  public abstract async bucketQuery(params: BucketQueryParams): Promise<BucketQueryReturn[]>;
  public abstract retrieve(id: string): Promise<Type>;
  public abstract update(id: string, payload: Type): Promise<void>;
  public abstract delete(id: string): Promise<void>;
  public abstract search(params: SearchParams, forceMatch?: boolean): Promise<SearchResult<Type>>;
  public abstract init(): Promise<void>;
}
