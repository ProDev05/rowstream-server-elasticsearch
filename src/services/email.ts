/**
 * Copyright (C) William R. Sullivan - All Rights Reserved
 * Written by William R. Sullivan <wrsulliv@umich.edu>, January 2019
 *
 * REFERENCE:  https://sendgrid.com/solutions/email-api/
 */

import { setApiKey, send } from '@sendgrid/mail';
import { conf } from '../config';
import { SendGridConfig } from '../models/config';
import { MailData } from '@sendgrid/helpers/classes/mail';

const sendgridConfig: SendGridConfig = conf.get('sendgrid');
setApiKey(sendgridConfig.api_key);

export const sendEmail = async (data: MailData) => {
  // @ts-ignore
  const res = await send(data);
  console.log('Sent Email!');
};
