/**
 * Copyright (C) William R. Sullivan - All Rights Reserved
 * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
 */

const uuidv4 = require('uuid/v4');

export const generateGUID = (): string => {
  return uuidv4();
};
