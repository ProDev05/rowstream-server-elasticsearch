/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

const nconf = require('nconf');

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'local';

const defaultConfig = `${__dirname}/../config/default.json`;
const envConfig = `${__dirname}/../config/${env}.json`;

nconf.argv().env('__').file('env', { file: envConfig }).file('default', { file: defaultConfig });

export const conf = nconf;
