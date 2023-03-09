/**
 * Copyright (c) 2021 Jonathan Andersen
 * Copyright (c) 2021 William R. Sullivan
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 */

import { APIUser, SearchParams, Message, MessageInternal } from 'sdk-library';
import { conf } from '../config';
import { RepoConfig, MessagingConfig } from '../models/config';
import { createBaseObject, updateBaseObject } from '../models/object';
import { UserInternal } from '../models/user';
import { getMessageRepo } from '../repositories';
import { Entity, InstanceAction, validateInstance } from './auth-service';
import { Expo } from 'expo-server-sdk';
import { retrieveTeam } from './team-service';
import { searchUsers } from './user-service';

const messagingConfig: MessagingConfig = conf.get('elastic');
const { should_notify: shouldNotify } = messagingConfig;

//  TODO:  Don't hard-code this.
const expo = new Expo({
  accessToken: 'zwliwZNZKRRtX_whB4DzzUZaHAZdWigjqIpKPzlZ',
});

const repoOptions: RepoConfig = conf.get('repository');
const messageRepo = getMessageRepo(repoOptions.message);

export const createMessage = async (message: Message, user: UserInternal) => {
  //  TODO:  Verify the recipient exists and the user has access.

  //  Create the Message
  const baseObj = createBaseObject(user);
  const messageInternal: MessageInternal = { ...message, ...baseObj };
  await messageRepo.create(messageInternal.id, messageInternal);

  //  Handle Push Notifications

  if (message.recipientType === 'boathouse') {
    //  Get Team Users
    const boathouseId = message.recipient;
    const team = await retrieveTeam(boathouseId, user);

    //  Get Users
    const userSearchTerms = team.players.map((username) => ({
      match: { id: username },
    }));
    const teamUsers = await searchUsers(
      { search: { any: userSearchTerms } },
      user
    );

    //
    //  Send Notifications
    //

    if (!shouldNotify) { return; }

    const expoPushTokens = teamUsers.results.map((user) => user.expoPushTokens || []);

    //  TODO:  Decouple this
    const messages: any[] = [];
    for (const tokens of expoPushTokens) {
      for (const token of tokens) {
        if (!Expo.isExpoPushToken(token)) {
          console.error(`Push token ${token} is not a valid Expo push token`);
          continue;
        }
        messages.push({
          to: token,
          sound: 'default',
          body: message.text,
          data: { message },
        });
      }
    }

    //  REFERENCE:  https://github.com/expo/expo-server-sdk-node
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);

        //  TODO-CRITICAL:  Handle ticket errors to avoid being banned
      } catch (error) {
        console.error(error);
      }
    }

    //  Send the Notification to All but Yourself
    //  TODO:  Build Notification Preferences
  } else {
    //  TODO:  Handle other message types
    //  TODO:  Decouple from this if-statement?
  }

  //  Return
  return messageInternal;
};

export const retrieveMessage = async (messageId: string, user: APIUser) => {
  //  Get the Message
  const messageInternal = await messageRepo.retrieve(messageId);

  //  Return the Message
  return messageInternal;
};

export const searchMessages = async (params: SearchParams, user: APIUser) => {
  //  Get the Messages
  const messageInternalList = await messageRepo.search(params);

  //  Validate Instance Access
  //  TODO:  Fix results count from pagination!  We should be filtering WITHIN the search to avoid extra return values.
  const permissionedMessageList: MessageInternal[] = [];
  for (let index = 0; index < messageInternalList.results.length; index++) {
    const message = messageInternalList.results[index];
    const hasAccess = await validateInstance(
      Entity.Message,
      InstanceAction.Read,
      user,
      message
    );
    if (hasAccess) {
      permissionedMessageList.push(message);
    }
  }

  //  Return the Messages
  return {
    results: permissionedMessageList,
    total: permissionedMessageList.length,
  };
};

export const updateMessage = async (
  messageId: string,
  message: Message,
  user: UserInternal
) => {
  //  Get Existing
  const existingMessage = await messageRepo.retrieve(messageId);

  //  Update the Message
  const baseObj = updateBaseObject(existingMessage);
  const updatedMessage = { ...message, ...baseObj };
  await messageRepo.update(updatedMessage.id, updatedMessage);

  //  Return the Message
  return updatedMessage;
};
