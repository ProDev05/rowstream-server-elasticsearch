/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import * as elasticsearch from 'elasticsearch';
import { conf } from './config';
import { ElasticConfig } from './models/config';
import * as AWS from 'aws-sdk';

const elasticConfig: ElasticConfig = conf.get('elastic');
const {
  host,
  use_aws: useAWS,
  aws_credentials: awsCredentials,
} = elasticConfig;

let elasticClient;

if (useAWS) {
  //  REFERENCE:  https://www.npmjs.com/package/http-aws-es
  console.log('USE AWS');
  const {
    access_key: accessKey,
    secret_key: secretKey,
    region,
  } = awsCredentials;

  //  Set the Region and Credentials
  AWS.config.update({
    credentials: new AWS.Credentials(accessKey, secretKey),
    region,
  });

  //  Create the AWS Client
  elasticClient = new elasticsearch.Client({
    hosts: [host],
    connectionClass: require('http-aws-es'),
  });
} else {
  console.log('NOT USE AWS');
  elasticClient = new elasticsearch.Client({
    host,
  });
}

export const elastic = elasticClient;
