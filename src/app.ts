/**
 * Copyright (c) 2019 Jonathan Andersen
 * Copyright (c) 2019 William R. Sullivan
 * Copyright (c) Microsoft Corporation
 *
 * This software is proprietary and owned by Jonathan Andersen.
 *
 * This software was based on https://github.com/wrsulliv/NodeStarter,
 * licensed under the MIT license.
 *
 * This software was based on https://github.com/Microsoft/TypeScript-Node-Starter,
 * licensed under the MIT license.
 */

import bodyParser from 'body-parser';
import compression from 'compression'; // compresses requests
import errorHandler from 'errorhandler';
import express from 'express';
import flash from 'express-flash';
import expressValidator from 'express-validator';
import lusca from 'lusca';
import passport from 'passport';
import path from 'path';
import { Role } from 'sdk-library';
import multer from 'multer';
import { createTestBoathouses } from './boathouse-test-setup';
import { conf } from './config';
import * as controllers from './controllers';
import { elastic } from './elastic';
import { createLloydMiller } from './lloyd-miller-setup';
import { tokenMiddleware } from './middleware/token-auth';
import { ElasticConfig, RepoConfig } from './models/config';
import { CreateUserParamsInternal } from './models/user';
import {
  getMessageRepo,
  getSessionRepo,
  getTeamRepo,
  getUserRepo,
} from './repositories';
import { getProfileRepo } from './repositories/profile';
import { getWorkoutRepo } from './repositories/workout';
import { getAdditional1SessionStatRepo, getAdditional2SessionStatRepo, getGeneralSessionStatRepo, getStrokeDataSessionStatRepo } from './repositories/session-stat';
import { createUsers } from './util/user';
import { getJerseyRepo } from './repositories/jersey';
import { createPinellasBoathouse } from './pinellas-setup';
import { createRoworxBoathouse } from './roworx-setup';
import { resetElastic, ResetType } from './reset';
import { createFighterDaveBoathouse } from './fighter-dave';
import { createPorter as createPorterBoathouse } from './porter-setup';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cors = require('cors');

/**
 * Create the Express SERVER
 */
const app = express();

/**
 * Configure Express
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'HEAD, OPTIONS, GET, POST, PUT, PATCH, DELETE, CONNECT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.locals.user = req.user;
  next();
});

/**
 * Web Routes
 */
app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);

/**
 * Unprotected API Routes (Guest Permitted by Controller)
 */
// app.post('/v0/users', controllers.createUser);
app.post('/v0/tokens', controllers.createToken);
app.get('/v0/verify/:verificationId', controllers.verifyUser);

/**
 * Middleware
 */
app.use(tokenMiddleware);

/**
 * Protected API Routes
 */
app.put('/v0/users/:userId', controllers.updateUser);
app.post('/v0/users/search', controllers.searchUsers);

app.get('/v0/jersey/config', controllers.getJerseysConfig);
app.get('/v0/jersey/download', controllers.downloadJersey);
app.post('/v0/jersey', controllers.handleCreateJersey);
app.post('/v0/jersey/search', controllers.handleSearchJersey);
app.get('/v0/jersey', controllers.handleRetriveJersey);
app.get('/v0/jersey/boathouse', controllers.retriveJerseyByTeamId);
app.put('/v0/jersey/:id', controllers.handleUpdateJersey);
app.delete('/v0/jersey/:jerseyId', controllers.handleDeleteJersey);

app.get('/v0/users/:userId', controllers.retrieveUser);
app.post('/v0/users/search', controllers.searchUsers);

app.post('/v0/profiles', controllers.createProfile);
app.get('/v0/profiles/:profileId', controllers.retrieveProfile);
app.put('/v0/profiles/:profileId', controllers.updateProfile);

app.post('/v0/sessions', controllers.createSession);
app.put('/v0/sessions/:sessionId', controllers.updateSession);
app.get('/v0/sessions/:sessionId', controllers.retrieveSession);
app.post('/v0/sessions/search', controllers.searchSessions);

//  General Stats
app.post(
  '/v0/session-general-stats',
  controllers.generalStatController.createSessionStat
);
app.post(
  '/v0/session-general-stats-bulk',
  controllers.generalStatController.createSessionStatsBulk
);
app.get(
  '/v0/session-general-stats/:sessionStatId',
  controllers.generalStatController.retrieveSessionStat
);
app.post(
  '/v0/session-general-stats/search',
  controllers.generalStatController.searchSessionStats
);
app.post(
  '/v0/session-general-stats-stats',
  controllers.generalStatController.getSessionStatStatistics
);
app.post(
  '/v0/session-general-stats-bucket',
  controllers.generalStatController.bucketQuery
);

//  Additional1 Stats
app.post(
  '/v0/session-additional1-stats',
  controllers.additional1StatController.createSessionStat
);
app.post(
  '/v0/session-additional1-stats-bulk',
  controllers.additional1StatController.createSessionStatsBulk
);
app.get(
  '/v0/session-additional1-stats/:sessionStatId',
  controllers.additional1StatController.retrieveSessionStat
);
app.post(
  '/v0/session-additional1-stats/search',
  controllers.additional1StatController.searchSessionStats
);
app.post(
  '/v0/session-additional1-stats-stats',
  controllers.additional1StatController.getSessionStatStatistics
);
app.post(
  '/v0/session-additional1-stats-bucket',
  controllers.additional1StatController.bucketQuery
);

//  Additional2 Stats
app.post(
  '/v0/session-additional2-stats',
  controllers.additional2StatController.createSessionStat
);
app.post(
  '/v0/session-additional2-stats-bulk',
  controllers.additional2StatController.createSessionStatsBulk
);
app.get(
  '/v0/session-additional2-stats/:sessionStatId',
  controllers.additional2StatController.retrieveSessionStat
);
app.post(
  '/v0/session-additional2-stats/search',
  controllers.additional2StatController.searchSessionStats
);
app.post(
  '/v0/session-additional2-stats-stats',
  controllers.additional2StatController.getSessionStatStatistics
);
app.post(
  '/v0/session-additional2-stats-bucket',
  controllers.additional2StatController.bucketQuery
);

//  Stroke Data Stats
app.post(
  '/v0/session-stroke-data-stats',
  controllers.strokeDataStatController.createSessionStat
);
app.post(
  '/v0/session-stroke-data-stats-bulk',
  controllers.strokeDataStatController.createSessionStatsBulk
);
app.get(
  '/v0/session-stroke-data-stats/:sessionStatId',
  controllers.strokeDataStatController.retrieveSessionStat
);
app.post(
  '/v0/session-stroke-data-stats/search',
  controllers.strokeDataStatController.searchSessionStats
);
app.post(
  '/v0/session-stroke-data-stats-stats',
  controllers.strokeDataStatController.getSessionStatStatistics
);
app.post(
  '/v0/session-stroke-data-stats-bucket',
  controllers.strokeDataStatController.bucketQuery
);

//  Teams
app.post('/v0/teams', controllers.createTeam);
app.put('/v0/teams/:teamId', controllers.updateTeam);
app.get('/v0/teams/:teamId', controllers.retrieveTeam);
app.post('/v0/teams/search', controllers.searchTeams);

//  Messages
app.post('/v0/messages', controllers.createMessage);
app.put('/v0/messages/:messageId', controllers.updateMessage);
app.get('/v0/messages/:messageId', controllers.retrieveMessage);
app.post('/v0/messages/search', controllers.searchMessages);

//  Workouts
app.post('/v0/workouts', controllers.createWorkout);
app.put('/v0/workouts/:workoutId', controllers.updateworkout);
app.get('/v0/workouts/:workoutId', controllers.retrieveworkout);
app.post('/v0/workouts/search', controllers.searchworkouts);
app.delete('/v0/workouts/:workoutId', controllers.deleteWorkout);

//  LoggerEvent
app.post('/v0/events', controllers.createEvent);
app.put('/v0/events/:eventId', controllers.updateEvent);
app.get('/v0/events/:eventId', controllers.retrieveEvent);
app.post('/v0/events/search', controllers.searchEvents);

// Uploads
app.post('/v0/upload', upload.single('file'), controllers.uploadFileUrl);

//  Default Error Handler
app.use(errorHandler());

/**
 * Initialize the Repos
 */
const initRepos = async () => {
  const repoOptions: RepoConfig = conf.get('repository');
  await getUserRepo(repoOptions.user).init();
  await getProfileRepo(repoOptions.profile).init();
  await getSessionRepo(repoOptions.session).init();
  await getGeneralSessionStatRepo(repoOptions.session_general_stat).init();
  await getAdditional1SessionStatRepo(
    repoOptions.session_additional1_stat
  ).init();
  await getAdditional2SessionStatRepo(
    repoOptions.session_additional2_stat
  ).init();
  await getStrokeDataSessionStatRepo(
    repoOptions.session_stroke_data_stat
  ).init();
  await getTeamRepo(repoOptions.team).init();
  await getWorkoutRepo(repoOptions.workout).init();
  await getMessageRepo(repoOptions.message).init();
  await getJerseyRepo(repoOptions.jersey).init();
  console.log('Initialized Repos');
};

//  Elastic Hack - Do not enter read only on low-disk space
//  REFERENCE:  https://www.elastic.co/guide/en/elasticsearch/reference/current/disk-allocator.html
export const hackElastic = async () => {
  const elasticConfig: ElasticConfig = conf.get('elastic');
  if (elasticConfig.disk_hack) {
    console.log('HACKING ELASTIC');
    await elastic.cluster.putSettings({
      body: {
        transient: {
          'cluster.routing.allocation.disk.watermark.low': '10gb',
          'cluster.routing.allocation.disk.watermark.high': '2gb',
          'cluster.routing.allocation.disk.watermark.flood_stage': '1gb',
          'cluster.info.update.interval': '1m',
          // 'cluster.routing.allocation.disk.watermark.flood_stage': '1gb'
        },
      },
    });
    console.log('Hack Elastic:  Raised the Elastic Flood Stage to 1GB.');
  }
};

export const systemUsers = {
  guest: {
    username: 'guest',
    email: 'guest@rowstream.com',
    password: 'testpass123',
    verified: true,
    roles: [],
  } as CreateUserParamsInternal,
  admin: {
    username: 'admin',
    email: 'admin@rowstream.com',
    password: 'RowStream*2019!',
    verified: true,
    roles: [Role.Administrator],
  } as CreateUserParamsInternal,
};

export const testUsers = {
  test_user: {
    username: 'test_user',
    email: 'test_user@rowstream.com',
    password: 'testpass123',
    verified: true,
    roles: [Role.Rower],
  } as CreateUserParamsInternal,
  consumer: {
    username: 'consumer',
    email: 'wrsulliv@umich.edu',
    password: 'testpass123',
    verified: true,
    roles: [Role.Rower],
  } as CreateUserParamsInternal,
  coach: {
    username: 'coach',
    email: 'coach@rowstream.com',
    password: 'testpass123',
    verified: true,
    roles: [Role.Coach],
  } as CreateUserParamsInternal,
  team_member_1: {
    username: 'team_member_1',
    email: 'tm1@rowstream.com',
    password: 'testpass123',
    verified: true,
    roles: [Role.Rower],
  } as CreateUserParamsInternal,
  team_member_2: {
    username: 'team_member_2',
    email: 'tm2@rowstream.com',
    password: 'testpass123',
    verified: true,
    roles: [Role.Rower],
  } as CreateUserParamsInternal,
  team_member_3: {
    username: 'team_member_3',
    email: 'tm3@rowstream.com',
    password: 'testpass123',
    verified: true,
    roles: [Role.Rower],
  } as CreateUserParamsInternal,
};

/**
 * Initialize the App
 */
export const initApp = async (): Promise<any> => {

  await hackElastic();
  await initRepos();

  console.log('About to create system users');
  await createUsers(
    Object.keys(systemUsers).map((key) => (systemUsers as any)[key])
  );
  console.log('Created system Users');
  console.log('About to create test users');
  await createUsers(
    Object.keys(testUsers).map((key) => (testUsers as any)[key])
  );
  console.log('Created test users');
  await createLloydMiller();

  console.log('Created LloydMiller');
  await createPinellasBoathouse();
  console.log('Created Pinellas');
  await createTestBoathouses();
  console.log('Generated Test Boathouses');
  await createRoworxBoathouse();
  console.log('Generated Roworx Boathouses');

  await createFighterDaveBoathouse();
  console.log('Generated Fighter Dave Boathouse');

  await createPorterBoathouse();
  console.log('Generated Porter Boathouse');

  return app;
};
