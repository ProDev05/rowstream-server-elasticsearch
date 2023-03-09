/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */


export interface RepoConfig {
  user: string;
  profile: string;
  session: string;
  team: string;
  message: string;
  session_general_stat: string;
  session_additional1_stat: string;
  session_additional2_stat: string;
  session_stroke_data_stat: string;
  event: string;
  workout: string;
  jersey: string;
}

export interface ElasticConfig {
  host: string;
  disk_hack?: boolean;
  use_aws: boolean;
  aws_credentials: {
    access_key: string;
    secret_key: string;
    region: string;
    service: string;
  };
}

export interface SendGridConfig {
  api_key: string;
}

export interface VerificationConfig {
  from: string;
  subject: string;
  email_template: string;
  success_template: string;
}

export interface MessagingConfig {
  should_notify: boolean;
}
export interface Config {
  repository: RepoConfig;
  elastic: ElasticConfig;
  sendgrid: SendGridConfig;
  host: string;
  token_secret: string;
  messaging: MessagingConfig;
}
