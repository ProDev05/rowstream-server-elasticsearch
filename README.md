# RowStream Server

## Setup
-  Clone the RowStreamSDK repo into /RowStreamSDK
-  `npm install`: Install dependencies
-  `npm run sdk:install:build`: Builds the SDK after installing dependencies
-  `npm run build`: Builds the server
-  `npm run dc:dev`: Starts a container for ElasticSearch alongside one for the server

## Deployment
-  Install the AWS CLI
-  [Install the ECS CLI](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html)
-  Configure the ECS Profile:

```ecs-cli configure profile --profile-name rowstream-profile --access-key $AWS_ACCESS_KEY_ID --secret-key $AWS_SECRET_ACCESS_KEY```

-  Configure the ECS Cluster:

```ecs-cli configure --cluster rowstream-cluster --default-launch-type EC2 --region us-east-2 --config-name rowstream-config```

-  Make sure you have AWS credentials on your computer. Run `aws configure` if not.
-  If you have not already authenticated with Docker Hub for the rowstreamdev account, run the following, and enter the password when prompted:

```
docker login -u rowstreamdev
```

-  Build and push server docker image
```
npm run docker:deploy
```

-  Restart ECS tasks with new docker image
```
npm run full-deploy
```

## Making a change in the SDK (TOOD: use a monorepo setup instead)
After you make a change in the SDK, you'll have to do the following for it to take effect as a dependency of the server.
1. npm run sdk:install:build
2. npm install


## Troubleshooting

Make sure to update the local copies of the Github dependencies (SDKLibrary) to ensure the right version is packaged!
