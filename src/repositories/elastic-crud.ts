/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { elastic } from '../elastic';
import { CRUDRepo } from './crud';
import { DeleteDocumentParams, SearchParams as ElasticSearchParams, IndicesPutSettingsParams, GetParams, CreateDocumentParams, IndexDocumentParams, BulkIndexDocumentsParams } from 'elasticsearch';
import { AggParams, AggResult, BucketQueryReturn, BulkBaseType, BucketQueryParams, SearchParams, SearchResult, AnySearchTerm, AllSearchTerm, MatchSearchTerm, SearchTerm } from 'sdk-library';

export const getAnyTerm = (anySearchterm: AnySearchTerm) => {

  //  Validate
  const { any } = anySearchterm;
  if (!any) {
    throw Error("Cannot generate an 'Any' search term with a non-any search term.");
  }

  //  Create the Elastic Query Terms
  const terms = any.map(anyTerm => {
    return getElasticQueryTerm(anyTerm);
  });

  const queryTerm = {
    bool: {
      should: [
        ...terms
      ]
    }
  };

  return queryTerm;

};

export const getAllTerm = (allSearchTerm: AllSearchTerm) => {

  //  Validate
  const { all } = allSearchTerm;
  if (!all) {
    throw Error("Cannot generate an 'Any' search term with a non-any search term.");
  }

  //  Create the Elastic Query Terms
  const terms = all.map(allTerm => {
    return getElasticQueryTerm(allTerm);
  });

  const queryTerm = {
    bool: {
      must: [
        ...terms
      ]
    }
  };

  return queryTerm;

};

export const getMatchTerm = (matchSearchTerm: MatchSearchTerm, forceMatch: boolean = false) => {

  //  Validate
  const { match } = matchSearchTerm;
  if (!match) {
    throw Error('Cannot generate a Match search term with a non-match search term.');
  }

    //
  //  Match Search Term Conversion
  //

  //  Validation
  //  TODO:  Validate Search Terms?

  //  Create the Elastic Query Terms
  //  TODO:  Differentiate between 'term' (exact match) and 'match' for approximate matching with scoring.
  //  NOTE:  In the TOP layer, each key -> value pair either returns a Term query OR a Nested Query.
  const matchKeys = Object.keys(match);
  const terms = matchKeys.map((matchKey: string) => {
    const value = match[matchKey];

    const getElasticMatchTerms = (path: string, value: any) => {
      if (typeof value == 'object') {

        //  TODO-CRITICAL:  The query logic assumes ALL nested docs use the ES "nested" type... make sure this is reasonable.
        return {
          nested: {
            path,
            query: {
                bool: {
                    must: Object.keys(value).map((nestedKey) => {
                      const nestedValue = value[nestedKey];
                      const fullPath = `${path}.${nestedKey}`;
                      const term: any = getElasticMatchTerms(fullPath, nestedValue);
                      return term;
                    })
                }
            }
        }
        };
      } else {
        if (forceMatch) {
          return { match: { [path]: value } };
        }
        return { term: { [path]: value } };
      }
    };

    const query = getElasticMatchTerms(matchKey, value);
    return query;

  });

  const elasticQueryTerm = {
    bool: {
      must: [
        ...terms
      ]
    }
  };

  return elasticQueryTerm;

};

export const getElasticQueryTerm = (searchTerm: SearchTerm, forceMatch: boolean= false): any => {

  //  Declare Types
  const matchSearchTerm = searchTerm as MatchSearchTerm;
  const allSearchTerm = searchTerm as AllSearchTerm;
  const anySearchterm = searchTerm as AnySearchTerm;

  //  Check Matchs
  if (matchSearchTerm.match !== undefined) {
    return getMatchTerm(matchSearchTerm, forceMatch);
  }

  //  Check All
  if (allSearchTerm.all !== undefined) {
    return getAllTerm(allSearchTerm);
  }

  //  Check Any
  if (anySearchterm.any !== undefined) {
    return getAnyTerm(anySearchterm);
  }
};

export const getElasticQuery = (searchTerm: SearchTerm, forceMatch: boolean= false) => {

  //  Handle Undefined (Return All)
  if (searchTerm == undefined) {
    return {
      query: {
        bool: {
          must: []
        }
      }
    };
  }

  //  Get Search Terms
  const elasticQueryTerm = getElasticQueryTerm(searchTerm, forceMatch);

  //  Create the Query
  const elasticQuery = {
    query: elasticQueryTerm
  };

  return elasticQuery;
};

export abstract class ElasticRepo<Type extends BulkBaseType> extends CRUDRepo<Type> {

  //  Repo Configuration
  protected shards: number = 1;
  protected replicas: number = 0;
  protected readOnly: boolean = undefined;
  protected refresh: boolean = true;
  protected type = '_doc';
  protected abstract properties: object;
  protected abstract indexName: string;

  //  Abstract Methods`
  public async create(id: string, payload: Type): Promise<void> {

    //  Create the Params Object
    const createParams: IndexDocumentParams<Type> = {
      id,
      index: this.indexName,
      type: this.type,
      body: payload
    };

    //  Index the Document
    await elastic.index(createParams);
    // console.log(`Elastic Repo:  Successfully added a document to the '${this.indexName}' index.`);

    //  If enabled, refresh the index
    if (this.refresh) {
      await elastic.indices.refresh({ index: this.indexName });
    }
  }

  public async createBulk(payloadList: Type[]): Promise<void> {

    //  Create the NDJSON Body
    const body = payloadList.map((payload: Type) => {
      const method = { index : { _index : this.indexName, _type : this.type, _id : payload.id } };
      return `${JSON.stringify(method)}\n${JSON.stringify(payload)}\n`;
    });

    //  Create the Params Object
    const bulkCreateParams: BulkIndexDocumentsParams = {
      index: this.indexName,
      type: this.type,
      body
    };

    //  Index the Document
    await elastic.bulk(bulkCreateParams);
    // console.log(`Elastic Repo:  Successfully added ${payloadList.length} documents to the '${this.indexName}' index using the Bulk API.`);

    //  If enabled, refresh the index
    if (this.refresh) {
      await elastic.indices.refresh({ index: this.indexName });
    }
  }

  //  TODO:  Make sure this is properly paging!
  public async getStats(params: AggParams): Promise<AggResult> {

    // console.log('Elastic Repo: Get Stats: ' + JSON.stringify(params));

    const aggsObj: any = {};
    for (const fieldName of params.fields) {
      aggsObj[fieldName] = { extended_stats : { field : fieldName } };
    }

    const searchParams: ElasticSearchParams = {
      index: this.indexName,
      type: this.type,
      body: {
        query: {
          match: {
            ...params.match
          }
        },
        aggs: aggsObj
      }
    };
    const res = await elastic.search<Type>(searchParams);
    const aggs: AggResult = res.aggregations;

    return aggs;
  }

  public async retrieve(id: string): Promise<Type> {

    //  Build Params
    const getParams: GetParams = {
      id,
      index: this.indexName,
      type: this.type
    };

    //  Query
    try {
      const res = await elastic.get<Type>(getParams);
      const source = res._source;
      return source;
    } catch (err) {
      if (err.statusCode === 404) { return undefined; }
      throw err;
    }
  }
  public async update(id: string, payload: Type): Promise<void> {

    //  Create the Params Object
    const indexParams: IndexDocumentParams<Type> = {
      id,
      index: this.indexName,
      type: this.type,
      body: payload
    };

    //  Index the Document
    await elastic.index(indexParams);
    // console.log(`Elastic Repo:  Successfully updated document '${id}' in the '${this.indexName}' index.`);

    //  If enabled, refresh the index
    if (this.refresh) {
      await elastic.indices.refresh({ index: this.indexName });
    }
  }

  public async delete(id: string): Promise<void> {

    //  Delete the Document
    const delParamsDoc: DeleteDocumentParams = {
      index: this.indexName,
      type: this.type,
      id
    };
    const docRes = await elastic.delete(delParamsDoc);
  }

  public async search(params: SearchParams, forceMatch: boolean= false): Promise<SearchResult<Type>> {

    //  Unpack Params
    //  TODO:  Deal with paging!
    const { size = 100, from = 0, search } = params;

    //  Get the Query
    //  TODO:  Deal with undefined SearchTerm?
    const query = getElasticQuery(search, forceMatch);

    //  Create the Query
    const searchParams: ElasticSearchParams = {
      index: this.indexName,
      type: this.type,
      from,
      size,
      body: query
    };

    const res = await elastic.search<Type>(searchParams);
    const rawHits = res.hits.hits;

    const sourceList: Type[] = [];
    for (let i = 0; i < rawHits.length; i++) {
      const hitSource = rawHits[i]._source;
      sourceList.push(hitSource);
    }

    const searchRes: SearchResult<Type> = {
      total: res.hits.total,
      results: sourceList
    };

    return searchRes;
  }

  public async bucketQuery(params: BucketQueryParams): Promise<BucketQueryReturn[]> {


    const aggsObj: any = {};
    for (const fieldName of params.bucketFields) {
      aggsObj[fieldName] = { extended_stats : { field : fieldName } };
    }

    const searchParams: ElasticSearchParams = {
      index: this.indexName,
      type: this.type,
      body: {
        query: {
          bool: {
            must: Object.keys(params.and).map((key: string) => ( { match: { [key]: params.and[key] } } ) )
          }
        },
        aggs : {
          bucket_query : {
            date_histogram : {
              field : params.timestampField,
              interval : params.interval
            },
            aggs: {
              ...aggsObj
            }
          }
        }
      }
    };

    const res = await elastic.search<Type>(searchParams);
    const rawBuckets: any[] = res.aggregations['bucket_query']['buckets'];
    const bucketResults = rawBuckets.map(rawBucket => {
      const stats: any = {};
      params.bucketFields.forEach(bucketField => {
        const aggData = rawBucket[bucketField];
        stats[bucketField] = aggData;
      });
      return {
        timestamp: rawBucket['key_as_string'],
        count: rawBucket['doc_count'],
        stats
      };
    });
    return bucketResults;
  }

  //  Instance Methods
  public async init(): Promise<void> {

    //  Define the Mapping
    const mappings = {
      _doc: {
        dynamic: 'strict',
        properties: this.properties
      }
    };

    //  Check for an Existing Index
    const exists = await elastic.indices.exists({ index: this.indexName });
    if (exists) {
      await elastic.indices.putMapping({
        index: this.indexName,
        type: this.type,
        body: mappings
      });
      console.log(`Elastic Initialization:  Index '${this.indexName}' exists.  Updated Mapping.`);
    } else {
      //  Create the Index
      await elastic.indices.create({
        index: this.indexName,
        body: {
          mappings,
          settings: {
            number_of_shards :   this.shards,
            number_of_replicas : this.replicas
          }
        }
      });
      console.log(`Elastic Initialization: Created index '${this.indexName}'.`);
    }

    if (this.readOnly !== undefined) {
      //  NOTE:  Used to disable error on low disk space.
      const settingsParams: IndicesPutSettingsParams = {
        index: this.indexName,
        body: {
          index: {
            blocks: {
              read_only_allow_delete: this.readOnly
              }
            }
          }
      };
      await elastic.indices.putSettings(settingsParams);
      console.log(`Elastic Initialization: Set 'read_only_allow_delete' to '${this.readOnly}' for index ${this.indexName}`);
    }

    console.log(`Elastic Initialization: Complete for index ${this.indexName}`);
  }
}
