import { delay } from 'lodash';
import {
  APIUser,
  BRStandings,
  Role,
  Workout,
  WorkoutInternal,
  WorkoutStat,
} from 'sdk-library';
import WS from 'ws';
import { initApp } from './app';
import { conf } from './config';
import { RepoConfig } from './models/config';
import { getProfileRepo } from './repositories/profile';
import { searchTeams, retrieveTeam } from './services/team-service';
import { retrieveWorkout, updateWorkout } from './services/workout-service';

import Agora from 'agora-access-token';

//
//  Interfaces
//

//  Generic

//  CONSIDER:  We COULD add a timestemp here.  Hmm... would that be client or server?
export interface Message {
  type: string;
  user?: APIUser;

  roomId?: string;
  userId?: string;
}

//  Online Members

export const ONLINE_MEMBERS_MESSAGE_TYPE = 'online-members';
export interface OnlineMembersMessage extends Message {
  type: typeof ONLINE_MEMBERS_MESSAGE_TYPE;
  members: string[];
}

export const MEMBER_STATUS_REQUEST_TYPE = 'member-status-request';
export const REGISTER_MEMBER_MESSAGE_TYPE = 'register-member';
export interface RegisterMemberMessage extends Message {
  type: typeof REGISTER_MEMBER_MESSAGE_TYPE;
}

export const UNREGISTER_MEMBER_MESSAGE_TYPE = 'unregister-member';
export interface UnRegisterMemberMessage extends Message {
  type: typeof UNREGISTER_MEMBER_MESSAGE_TYPE;
}

//  Video Streaming
export interface OfferMessage extends Message {
  type: 'offer';
  offer: RTCSessionDescription;
}

export interface ActiveHostsMessage extends Message {
  type: 'active-hosts';
  announcements: HostAnnouncementMessage[];
}

export interface HostAnnouncementMessage extends Message {
  type: 'host-announcement';
}

export const GET_ANNOUNCEMENTS_TYPE = 'get-announcements';
export const HOST_CLOSE_MESSAGE_TYPE = 'host-close';
export interface HostCloseMessage extends Message {
  type: typeof HOST_CLOSE_MESSAGE_TYPE;
}

export interface NewSubscriberMessage extends Message {
  type: 'new-subscriber';
}

//
//  Boathouse Racing
//

//  Join Boathouse Race
//  TODO:  Get types from the SDK.
export const BR_JOIN_MESSAGE = 'br-join';
export interface BRJoinMessage extends Message {
  type: typeof BR_JOIN_MESSAGE;
  userId: string;
  workoutId: string;
}

const boathouseRaces: {
  [workoutId: string]: {
    workout: WorkoutInternal;
    standings: BRStandings;
  };
} = {};

const userToClientMap: {
  [username: string]: WS;
} = {};

export const BOATHOUSE_RACE_STATUS_MESSAGE = 'br-status';
export interface JoinBoathouseRaceStatusMessage extends Message {
  type: typeof BOATHOUSE_RACE_STATUS_MESSAGE;
  workoutId: string; //  Boathouse Race ID
  standings: BRStandings;
}

//  Boathouse Race Workout
export const BOATHOUSE_RACE_DISTANCE_MESSAGE = 'br-distance';
export interface BoathouseRaceDistanceMessage extends Message {
  type: typeof BOATHOUSE_RACE_DISTANCE_MESSAGE;
  userId: string;
  distance: number;
  workoutId: string;
  timestamp: string;
}

export const BOATHOUSE_RACE_STANDINGS_MESSAGE = 'br-standings';
export interface BoathouseRaceStandingsMessage extends Message {
  type: typeof BOATHOUSE_RACE_STANDINGS_MESSAGE;
  standings: BRStandings;
}

const systemUser: APIUser = {
  username: 'system',
  roles: [Role.Administrator],
  email: 'wrsulliv@umich.edu',
  expoPushTokens: [],
  verified: true,
};

export const BOATHOUSE_RACE_END_MESSAGE = 'br-end';
export interface BoathouseRaceEndMessage extends Message {
  workout: WorkoutInternal;
  type: typeof BOATHOUSE_RACE_END_MESSAGE;
}

//  NOTE:  FOR NOW, we just broadcast the simple data given a race (Workout ID)!
//         We should ONLY broadcast to clients who KNOW the Workout ID.  The knowledge of this ID is their "password".

//  Workout Client Map
const workoutClientMap: { [workoutId: string]: WS[] } = {};

const clients: any[] = [];

//  TODO:  In the future, scope by Team!   MAYBE allow Public streaming too? Hmm

//  TODO:  Can be shared between server and client

const announcements: HostAnnouncementMessage[] = [];

const LEADERBOARD_STAT_MESSAGE_TYPE = 'workout-stat';
export interface LeaderboardStatMessage extends Message {
  type: 'workout-stat';
  stat: WorkoutStat;
}

//  Log Past Messages?
//  TODO:  SHOULD have coordination around teams and stuff too? Hmm...
const messageLog: any[] = [];

const members: string[] = [];

//  CONSIDER:  WHY can't an aribitrary encoding be used as the KEY and then we have systems to SUPPORT accessing that???
const clientAnnouncementMap: {
  client: WS;
  announcement: HostAnnouncementMessage;
}[] = [];

//  Initialize the Repos
//  TODO:
const repoOptions: RepoConfig = conf.get('repository');
const profileRepo = getProfileRepo(repoOptions.profile);

const getUsersTeam = async (user: APIUser) => {
  //  Find User Team
  const teams = await searchTeams(
    { search: { match: { players: user.username } } },
    user
  );
  if (teams.total < 1) {
    throw `No team found for user '${user.username}'`;
  }
  if (teams.total > 1) {
    throw `Multiple teams found for user '${user.username}'.  Currently a user may only be on a single team.`;
  }
  const userTeam = teams.results[0];
  return userTeam;
};

const getUsersProfile = () => {};

/**
 * Start Express server.
 */
const initServer = async (): Promise<any> => {
  const app = await initApp();
  const server = app.listen(app.get('port'), () => {
    console.log(
      '  App is running at http://localhost:%d in %s mode',
      app.get('port'),
      app.get('env')
    );
    console.log('  Press CTRL-C to stop\n');
  });

  /**
   * Start the Websocket Server
   */

  const ws = new WS.Server({ server });

  ws.on('connection', (client) => {
    //  Log the Connection
    console.log('NEW WEBSOCKET CLIENT');
    clients.push(client);

    //  Send Debug Info
    // clients.forEach(_client => {
    //   console.log('Sending Client Count: ' + clients.length);
    //   _client.send(JSON.stringify({ type: 'client-count', clientCount: clients.length }));
    // });

    client.on('close', () => {
      //  Get Announcement
      const mapEntry = clientAnnouncementMap.find(
        (entry) => entry.client === client
      );
      if (mapEntry) {
        //  Remove Announcement (if it exists)
        const announcementIndex = announcements.findIndex(
          (_announcement) => _announcement == mapEntry.announcement
        );
        if (announcementIndex != -1) {
          announcements.splice(announcementIndex);
        }

        //  Remove ClientAnnouncementMap
        const clientAnnouncementMapIndex = clientAnnouncementMap.findIndex(
          (entry) => entry == mapEntry
        );
        if (clientAnnouncementMapIndex != -1) {
          clientAnnouncementMap.splice(clientAnnouncementMapIndex);
        }
      }

      //  Clear Client
      const closedClientIndex = clients.findIndex(
        (_client) => _client === client
      );
      clients.splice(closedClientIndex, 1);
    });

    client.on('message', async (rawMessage: any, callback: any) => {
      //  Parse Message

      const message: Message = JSON.parse(rawMessage);

      //
      //  Agora
      //

      if (message.type === 'rtctoken') {
        const appID = '26151d6214234c15bf6b5da74e1338ce';
        const appCertificate = '13ca34c943534849ac376e15ae98d8bf';
        const expirationTimeInSeconds = 3600;
        const uid = 0;
        const role = Agora.RtcRole.SUBSCRIBER;
        const channelName = message.roomId;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = Agora.RtcTokenBuilder.buildTokenWithUid(
          appID,
          appCertificate,
          channelName,
          uid,
          role,
          privilegeExpiredTs
        );

        console.log({ token });
        client.send(
          JSON.stringify({
            type: 'rtctoken',
            userId: message?.userId,
            data: {
              appId: '26151d6214234c15bf6b5da74e1338ce',
              channel: message.roomId,
              token: token,
            },
          })
        );
        return;
      }
      messageLog.push(message);

      //
      //  Boathouse Racing
      //

      //  BR Join Message

      if (message.type === BR_JOIN_MESSAGE) {
        //  Type the Message
        const brJoinMessage = message as BRJoinMessage;

        //  Unpack
        const { type, userId, workoutId, user } = brJoinMessage;

        //  Get BRStatus
        let brStatus = boathouseRaces[workoutId];

        //  Create BRStatus if needed
        if (!brStatus) {
          //  Get the Workout
          const workout = await retrieveWorkout(workoutId, user);

          //  Create the Initial Boathouse Standings
          const initialStandings: BRStandings = {};
          for (const boathouseId of workout.contestants || []) {
            //  Get the Boathouse
            const boathouse = await retrieveTeam(boathouseId, user);

            //  Get a Color
            //  REFERENCE:  https://css-tricks.com/snippets/javascript/random-hex-color/
            const color =
              '#' + Math.floor(Math.random() * 16777215).toString(16);

            //  Set Initial Standings
            initialStandings[boathouseId] = {
              distance: 0,
              users: {},
              boathouse,
              color,
              elapsedTime: 0,
            };
          }

          //  Add the Boathouse Race
          boathouseRaces[workoutId] = {
            workout,
            standings: initialStandings,
          };
          brStatus = boathouseRaces[workoutId];
          console.log('BR:  Added a new boathouse race:  ' + workoutId);
        }

        //  Find User's Team
        const usersTeam = await getUsersTeam(user);
        const boathouseId = usersTeam.id;

        //  Get the Profile
        const profile = await profileRepo.retrieve(user.username);

        //  Get Boathouse Standings
        const boathouseStandings = brStatus.standings[boathouseId];

        //  Update Boathouse Standings
        boathouseStandings.users[userId] = {
          profile,
          user,
          distance: 0,
        };

        //  Add the Client
        userToClientMap[user.username] = client;

        //  Update Clients (all those in this Boathouse Race)
        for (const boathouseId in brStatus.standings) {
          const boathouseInfo = brStatus.standings[boathouseId];
          for (const username in boathouseInfo.users) {
            //  Get the User Info
            const userInfo = boathouseInfo.users[username];

            //  Get the Client
            const _client = userToClientMap[userInfo.user.username];

            //  Create the BRStatusMessage
            const brStatusMessage: JoinBoathouseRaceStatusMessage = {
              type: BOATHOUSE_RACE_STATUS_MESSAGE,
              workoutId,
              standings: brStatus.standings,
            };

            //  Send the BRStatusMessage
            _client.send(JSON.stringify(brStatusMessage));
          }
        }
      }

      //  TODO:  Get this from the SDK!
      const getWorkoutStartTime = (workout: WorkoutInternal) => {
        const { startTime, type } = workout;
        const isRace = type === 'boathouse-race' || type === 'race';
        return isRace
          ? new Date(startTime).getTime() + 1 * 60 * 1000
          : new Date(startTime).getTime();
      };

      //  BR Distance Message
      if (message.type === BOATHOUSE_RACE_DISTANCE_MESSAGE) {
        //  TODO:  This should be a FAST function because it's called often.  Remove the async calls and cache instead.

        //  Type the Message
        const brDistanceMessage = message as BoathouseRaceDistanceMessage;

        //  Log
        console.log(JSON.stringify(brDistanceMessage));

        //  Unpack
        const { type, userId, user, distance, timestamp, workoutId } =
          brDistanceMessage;

        //  Find User's Team
        const usersTeam = await getUsersTeam(user);
        const boathouseId = usersTeam.id;
        console.log('Got Team');

        //  Get BRStatus
        const brStatus = boathouseRaces[workoutId];

        //  Get BRBoathouseStatus
        const brBoathouseStatus = brStatus.standings[boathouseId];

        //  Update Elapsed Time
        const raceStartTime = getWorkoutStartTime(brStatus.workout);
        const messageTime = new Date(brDistanceMessage.timestamp).getTime();
        const elapsedTime = messageTime - raceStartTime;
        brBoathouseStatus.elapsedTime = elapsedTime;

        //  Update User Distance
        brBoathouseStatus.users[user.username].distance = distance;

        //  Calculate the Boathouse Distance
        const boathouseUserCount = Object.keys(brBoathouseStatus.users).length;
        if (boathouseUserCount <= 0) {
          throw new Error(`No users in the boathouse.`);
        }
        let boathouseDistance = 0;
        for (const username in brBoathouseStatus.users) {
          const userInfo = brBoathouseStatus.users[username];
          boathouseDistance += userInfo.distance;
        }
        boathouseDistance = boathouseDistance / boathouseUserCount;
        console.log('Calculated Distance: ' + boathouseDistance.toString());

        //  Update Boathouse Distance
        brBoathouseStatus.distance = boathouseDistance;

        //  Check Completion
        const isCompleted = boathouseDistance >= brStatus.workout.distance;

        //  Handle Completion
        let updatedWorkout: WorkoutInternal | undefined = undefined;
        if (isCompleted) {
          //  Update the Workout
          const { workout } = brStatus;
          const _updatedWorkout: Workout = {
            ...workout,
            standings: JSON.stringify(brStatus.standings),
          };
          updatedWorkout = await updateWorkout(
            workout.id,
            _updatedWorkout,
            systemUser
          );
        }

        //  Update Clients (all those in this Boathouse Race)
        console.log('About to Update Clients: ' + JSON.stringify(brStatus));
        for (const boathouseId in brStatus.standings) {
          const boathouseInfo = brStatus.standings[boathouseId];
          for (const username in boathouseInfo.users) {
            //  Get the User Info
            const userInfo = boathouseInfo.users[username];

            //  Get the Client
            const _client = userToClientMap[userInfo.user.username];
            if (!_client) {
              console.log('No Client!');
            } else {
              console.log('Got Client');
            }

            //  Create the BRStatusMessage
            const brStandingsMessage: BoathouseRaceStandingsMessage = {
              type: BOATHOUSE_RACE_STANDINGS_MESSAGE,
              standings: brStatus.standings,
            };

            //  Create the BREndMessage
            // const brEndMessage: BoathouseRaceEndMessage = {
            //   workout: updatedWorkout,
            //   type: BOATHOUSE_RACE_END_MESSAGE,
            // };

            _client.send(JSON.stringify(brStandingsMessage));
            console.log(
              "Send BR Standings to '" +
                userInfo.user.username +
                "': " +
                JSON.stringify(brStandingsMessage)
            );
          }
        }
      }

      //
      //  WebRTC
      //

      if (message.type === GET_ANNOUNCEMENTS_TYPE) {
        //  Send Active Hosts on Connect
        const activeHostsMessage: ActiveHostsMessage = {
          type: 'active-hosts',
          announcements,
        };
        console.log('Sending ActiveHosts Message');
        console.log(activeHostsMessage);
        client.send(JSON.stringify(activeHostsMessage));
      }

      if (message.type === HOST_CLOSE_MESSAGE_TYPE) {
        const hostCloseMessage = message as HostCloseMessage;
        console.log(
          'Received HostCloseMessage from ' + hostCloseMessage.user.username
        );

        //  Remove Announcement (if it exists)
        const announcementIndex = announcements.findIndex(
          (announcement) =>
            announcement.user?.username === hostCloseMessage.user?.username
        );
        if (announcementIndex != -1) {
          announcements.splice(announcementIndex);
        }

        //  Remove ClientAnnouncementMap Entry (if it exists)
        //  TODO:  Ensure users can only send WS messages with their OWN user!  So.. WS ACL!
        const clientAnnouncementMapIndex = clientAnnouncementMap.findIndex(
          (entry) =>
            entry.announcement.user.username === hostCloseMessage.user?.username
        );
        if (clientAnnouncementMapIndex != -1) {
          clientAnnouncementMap.splice(clientAnnouncementMapIndex);
        }
      }

      if (message.type === 'offer') {
        const offerMessage = message as OfferMessage;
        console.log('Offer Received!');

        //  Check Existing
        // const existing = offers.find(offer => offer.user.username === message.user.username);
        // if (existing) {
        //   existing.offer = offerMessage.offer;
        //   existing.user = offerMessage.user;
        // } else {
        //   offers.push(offerMessage);
        // }
      }

      if (message.type === 'host-announcement') {
        const announcementMessage = message as HostAnnouncementMessage;
        console.log(
          'Received HostAnnouncement from ' + announcementMessage.user.username
        );

        const existing = announcements.find(
          (announcement: any) =>
            announcement.user.username === message.user.username
        );
        if (!existing) {
          announcements.push(announcementMessage);
          clientAnnouncementMap.push({
            announcement: announcementMessage,
            client,
          });
        }

        // announcements.push(announcementMessage);

        //  TODO:  Check Existing?
        // //  Check Existing
        // const existing = offers.find(offer => offer.user.username === message.user.username);
        // if (existing) {
        //   existing.offer = offerMessage.offer;
        //   existing.user = offerMessage.user;
        // } else {
        //   offers.push(offerMessage);
        // }
      }

      if (message.type === 'new-subscriber') {
        console.log(
          'Received New Subscriber Message: ' + JSON.stringify(message)
        );
      }

      //
      //  Leaderboard
      //

      if (message.type === 'workout-stat') {
        const leaderboardStatMessage = message as LeaderboardStatMessage;
        console.log(
          'Received LeaaderboardStat Message:' +
            JSON.stringify(leaderboardStatMessage)
        );

        const { stat, user } = leaderboardStatMessage;
        const { workoutId } = stat;

        //  Make the Client Pool
        if (!workoutClientMap[workoutId]) {
          workoutClientMap[workoutId] = [];
        }
        const clientPool = workoutClientMap[workoutId];

        //  Add the Client to the Pool (if needed)
        if (clientPool.indexOf(client) == -1) {
          clientPool.push(client);
        }

        //  Broadcast
        clientPool.forEach((recipient) => {
          recipient.send(JSON.stringify(leaderboardStatMessage));
        });

        return;
      }

      //
      //  Indicators
      //

      if (message.type === MEMBER_STATUS_REQUEST_TYPE) {
        console.log('Received Member Status Request Message');

        //  Send Member Status on Connect
        const membersMessage: OnlineMembersMessage = {
          type: ONLINE_MEMBERS_MESSAGE_TYPE,
          members,
        };
        console.log('Sending Members Message');
        console.log(membersMessage);
        client.send(JSON.stringify(membersMessage));
      }

      if (message.type === REGISTER_MEMBER_MESSAGE_TYPE) {
        console.log('Received RegisterMember Message');

        //  Cast the Message
        //  CONSIDER:  Can NORMALIZE this outside as a cross-concern.
        const registerMemeberMessage: RegisterMemberMessage =
          message as RegisterMemberMessage;
        const memberName = registerMemeberMessage.user?.username;
        if (!memberName) {
          return;
        }

        if (members.includes(memberName)) {
          return;
        }

        members.push(memberName);

        //  Online Members Message
        const membersMessage: OnlineMembersMessage = {
          type: ONLINE_MEMBERS_MESSAGE_TYPE,
          members,
        };

        //  TODO:  This is to solve a race condition between the HOME page when we send the messsage and receive it on the Boathouse page.  We SHOULD perhaps use a singleton WS instance on the client, perhaps adding handlers using the registration pattern as I do in lots of other apps.
        delay(() => {
          console.log('Sending Members Message');
          console.log(membersMessage);
          client.send(JSON.stringify(membersMessage));
        }, 5000);
      }

      if (message.type === UNREGISTER_MEMBER_MESSAGE_TYPE) {
        console.log('Received UnregisterMember Message');

        //  Cast the Message
        //  CONSIDER:  Can NORMALIZE this outside as a cross-concern.
        const unregisterMemeberMessage: UnRegisterMemberMessage =
          message as UnRegisterMemberMessage;
        const memberName = unregisterMemeberMessage.user?.username;
        if (!memberName) {
          return;
        }

        if (!members.includes(memberName)) {
          return;
        }

        members.splice(members.indexOf(memberName));

        //  Online Members Message
        const membersMessage: OnlineMembersMessage = {
          type: ONLINE_MEMBERS_MESSAGE_TYPE,
          members,
        };

        console.log('Sending Members Message');
        console.log(membersMessage);

        client.send(JSON.stringify(membersMessage));
      }

      //
      //  Global Forwarding
      //  TODO:  This MAY be too much.  Be more surgical about what messages are sent.  SHOULD be OK for now!
      //
      clients.forEach((_client) => {
        if (client !== _client) {
          _client.send(JSON.stringify(message));
        }
      });
    });
  });

  return server;
};

initServer();
