import { APIUser, Profile, Team, TeamInternal } from 'sdk-library';
import { conf } from '../config';
import { RepoConfig } from '../models/config';
import { CreateUserParamsInternal } from '../models/user';
import { getTeamRepo } from '../repositories';
import { getProfileRepo } from '../repositories/profile';
import {
  createTeam,
  retrieveTeam,
  searchTeams,
  updateTeam,
} from '../services/team-service';
import { createNewUser, retrieveUser } from '../services/user-service';

const host = 'http://localhost:3000/v0';

// const teamSDK = new TeamSDK(host);
//  const tokenSDK = new TokenSDK(host);
//  const profileSDK = new ProfileSDK(host);

//  Initialize the Repos
const repoOptions: RepoConfig = conf.get('repository');
const profileRepo = getProfileRepo(repoOptions.profile);

export interface UserConfig {
  user: CreateUserParamsInternal;
  profile: Profile;
  isTeamOwner?: boolean;
}

export interface TeamConfig {
  name: string;
  avatar: string;
}

export const getUsersTeam = async (user: APIUser) => {
  const teams = await searchTeams(
    { search: { match: { players: user.username } } },
    user
  );

  if (teams.total < 1) {
    return undefined;
  }
  if (teams.total > 1) {
    throw new Error(
      `Multiple teams found for user '${user.username}'.  Currently a user may only be on a single team.`
    );
  }
  const userTeam = teams.results[0];
  return userTeam;
};
export const createUsers = async (users: CreateUserParamsInternal[]) => {
  for (const user of users) {
    const existing = await retrieveUser(user.username);
    if (!existing) {
      await createNewUser(user);
    }
  }
};

export const createUsersFromConfig = async (
  users: UserConfig[],
  teamConfig: TeamConfig
) => {
  const userMap: { [userId: string]: APIUser } = {};

  for (const user of users) {
    const existing = await retrieveUser(user.user.username);
    if (!existing) {
      console.log(
        `User '${user.user.username}' was not found.  Creating now...`
      );
      const newUser = await createNewUser(user.user);
      console.log(`Created User '${user.user.username}'.`);
      userMap[newUser.username] = newUser;
      // const token = (await tokenSDK.create({ username: user.user.username, password: user.user.password })).token;
      await profileRepo.create(user.user.username, {
        ...user.profile,
        id: user.user.username,
        username: user.user.username,
      });
      console.log(`Created Profile for User '${user.user.username}'.`);
    } else {
      userMap[existing.username] = existing;
    }
  }

  //  Get the Owner
  const owner = users.find((user) => user.isTeamOwner === true);
  if (!owner) {
    console.log('Built the Users, but no Owner was specified.');
    return;
  }

  console.log('Owner: ' + JSON.stringify(owner));



  //  Get Existing Team
  console.log('Getting Users Team');
  const existingTeam: TeamInternal = await getUsersTeam(owner.user as any);

  console.log('Users Team: ' + JSON.stringify(existingTeam));

  const teamPayload: any = {
    players: users.map((user) => user.user.username),
    invites: [],
    name: teamConfig.name,
    avatar_url: teamConfig.avatar,
  };

  //  Create If Needed
  if (!existingTeam) {
    await createTeam(teamPayload, { ...owner.user, expoPushTokens: [] });
  } else {
    await updateTeam(existingTeam.id, teamPayload, owner.user as any);
  }
};
