# AiX v2.0

## MicroServices Architecture
The AiX platform is implemented using MicroServices, as the majority of services are `Nodejs`, the choosen framework is [Moleculer](https://moleculer.services). Other Microservices using different languages can follow the [Moleculer protocol for messages](http://moleculer.services/docs/0.13/api/protocol.html) and interact with Nodejs serivces.

## Before start load some fixtues
You need to run the fixtures first to populate the mongodb database with some infomration.
In order to do that, copy the `.samples.js` located `services/db/fixtues`  to .`js` files, and then run
```
yarn fixtures
```

## Quick start without Telegram using CLI webhook mock
To get started quicly you can use a CLI program that mocks the Telegram Webhook,
you still need a `Trader` but the CLI program will ask you to pick one from the database,
whe you start the program
```
yarn cli
```
You can skip the trader selector if you pass `-t telegram_id` flag.
```
yarn cli -t 509318934
```
Additionally you can enable moleculer logs by passing the `-l flag`
```
yarn cli -t 509318934 -l
```

## Quick start for local development with Telegram bot

For local development you can do a complete setup on you local machine (more complex and takes longer) or you can use Docker.

For both of this setups you will need:
* A Telegram Bot - create one using [BotFather](https://core.telegram.org/bots#6-botfather)
* To clone this repository locally
* ngrouk (https://ngrok.com/) in order to make your local app public on the web and connect it to your Telegram Bot

Follow this steps to get your environment up and running:

### 1. Local development setup with Docker
Requirements: [Docker] (https://www.docker.com/)

Copy `.env.example` to `.env`
In the `.env` file udate the values for: 
* `TELEGRAM_BOT_USERNAME`, `TELEGRAM_TOKEN` - with the AUTH Token and Username of the bot you created. You can find this details of your bot using BotFather.
* `WATSON_USERNAME`, `WATSON_PASSWORD`, `WATSON_WS_ID` - if you want to use other workspace then the on prefilled (usually this will be the Development instance of Watson)
* `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET` - AWS S3 credentials
* Make sure `CHAT_FEATURE_NGROK_TUNNEL` is set to `true` for local development
* Make sure `NODE_ENV` is set to `development`

To run the app:
```
# In a separate terminal start a tunnel to port 5000
ngrok http localhost:5000

# Copy the tunnel address something like https://89f9802b.ngrok.io
# and inside aix-next folder pass the tunnel address as an ENV var to docker
TUNNEL_URL=https://89f9802b.ngrok.io docker-compose up
```

It will take some time for Docker to build the images and download all the dependencies. When the entire process is done and the app is running you should see in the terminal the message:
```
aix-next    | ✓ AiX Next is up and running
```

Docker is using `nodemon` to start the app, so the services will be reloaded automatically when you make a change.

To test all is working, go to Telegram and say `Hi` to your bot and the bot should reply.

### 2. Local development setup
Requirements: nodejs, mongodb and redis

Make sure mongodb and redis are running before moving forward.

Follow this steps to get your environment up and running.
```
git clone git@bitbucket.org:heronai/aix-next.git
cd aix-next
npm install
node_modules/lerna/bin/lerna.js bootstrap (if lerna is not installed globally)
```
Before running the packages we need to copy the `.env.example` file to `.env`
and replace the values with your own values (See above details in Docker section).
Also, make sure `MONGODB_URI` and `REDIS_URL` are set according to your local instances.

In order to have some data in your database, please duplicate the `*.sample.js` files from `services/db/fixtures/development` and input your own telegram profiles data in `traders.js` and update `inter-document-map.js` with your telegram ids in order to link the traders with the financial instruments. The `financial-instruments.js` file can have the same content as the sample file. 

In order to run the fixtures, just run `npm run fixtures` in the root of the project.

To run the app
```
# in a separate terminal start a tunnel to port 5000
ngrok http localhost:5000
# copy the tunnel address something like https://89f9802b.ngrok.io
# and inside aix-next pass the tunnel address as an argument
npm start -- https://89f9802b.ngrok.io
```
npm start runs `nodemon` so the services will be reloaded automatically when you make a change.

To test all is working, go to the ngrok.io tunnel url and you should see a Login with telegram button. Also, go to Telegram and say `Hi` to your bot and the bot should reply.

### Optional setup steps

In order to test different transporter you'll need to install active-mq, kafka or the one you choose. 

The logger is also plugable, if you want to experiment with elasticsearch, kibana and/or logstash you'll have to install those separately.

## Website
- `packages/web` it contains the web authentication and registers the webhook to the telegram bot, it calls `chat` microservice when receiving an incoming message, and replies what it gets back from `chat` service.

## Chat MicroService
`services/chat`
It receives incoming chat messages, and can call `db` microservices to retreive the trader information, can also call `price` service if it needs price or a infocard to reply the message.
### Actions
- incoming: receives the incoming message from botmaster the reply is sent directly
to the user telegram.

## DB Microservice
- `service/db` is where the db models are, right now only exposes `db.trader.show` action, but we can have as many actions as we need to interact with the database.

## Price Microservice
- `service/price` it connects with cryptocompare api, and also knows how to create infocards images and upload them to S3

## Deployment to AWS
The file `bitbucket-pipelines.yml` defines how the docker containers are built (including the latest version of the code inside), tagged and push to the AWS registry.  
Also the infrastracture is upgraded if needed with the terraform command.  

If changing environments on AWS there is a initial setup todo:  
- create a S3 bucket to store the terraform state: `aix-next-terraform-state`
- create a MongoDB database in Atlas (also import any data you need: traders, financial instruments)
This can be improved using AWS vault or similar for secrets managment. 

1. Create IAM User with Programmatic access. Should be named `AixNextTerraform`
2. Attach the following policies:
AmazonEC2RoleforAWSCodeDeploy
AmazonEKSClusterPolicy
AmazonEC2ContainerRegistryFullAccess
AmazonS3FullAccess
AWSElasticBeanstalkMulticontainerDocker
AmazonVPCFullAccess
AmazonECSTaskExecutionRolePolicy
AdministratorAccess

3. Copy `acess_example_tf` from `/terraform/secrets` to `/terraform/acccess.tf` and add the credentials of the user created on the 1st step.
4. In the AWS S3 console make sure you create the folder `state` where terraform will save the state.
5. Now run `terraform init --backend-config="access_key=your_aws_access_key" --backend-config="secret_key=your_aws_secret_key"` in the `/terraform` folder. If you get an error similar to `Error loading state: AccessDenied: Access Denied status code: 403 ...` and you are sure the user has access to S3, delete the folder `.terraform` if it exists and try again.
6. Now run `terraform apply` in the `/terraform` folder. This should start building your infrastructure on AWS. After is done you can check on AWS console if the resources were created. For the moment there is an issue here, because at the end there is an error `* aws_elasticache_subnet_group.elasticache: Error creating CacheSubnetGroup: InvalidParameterValue: The parameter CacheSubnetGroupName is not a valid identifier.` but the Redis seems to be created and working.
7. Generate a new key to be used by BitBucket Pipeline for deployments
```
#private key
openssl genpkey -algorithm RSA -out aix-next-deployment.pem -pkeyopt rsa_keygen_bits:2048
# public key
openssl rsa -pubout -in aix-next-deployment.pem -out aix-next-deployment_pub.pem
```
8. Upload the generate private and public keys to the S3 Bucket created at the 1st step: `aix-next-terraform-state/terraform/`
9. In the AWS Console go to IAM Users. Select the user created in the 2nd step `AixNextTerraform`, go to Security credentials and upload the SSH public key.
10. Upload the `access.tf` file with the credentials for the `AixNextTerraform` user to the S3: `aix-next-terraform-state/terraform/access.tf` to be used by the Bitbucket Pipeline.
11. Create a copy of `.env.example` and update the data with the ones specific to your new environment. After this rename the file to `env` and upload it to S3 `aix-next-terraform-state/terraform/env-vars`.
12. Update Bitbucket Pipeline file if is required. Maybe you will need to create a new branch for your environment, update AWS credentials, ECS Repo URI and so on.
13. Now you can run `terraform apply`
14. Create a new domain to which you want to attache the application.
15. Create a SSL certificat for this domain on the AWS account where the new env infrastructure is created (basically where the ELB to which is going to be attached is)
16. Attach the ELB DNS Name of the new env within the Route 53 of the `aws.aix@heron.ai` account.
17. Add a new HTTPS Listener to the existing Load Balancer.

## Docker
Services can be run separately in their own docker container
for to run the chat service
```
docker run --env-file .env aix/micro /bin/sh -c 'node_modules/.bin/moleculer-runner -r services/chat/chat.service.js'
```

## Redis on AWS

AWS Redis doesn't support Redis's 'config' command to set for example notifications events. This needs to be done manually from the AWS console: `https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/ParameterGroups.Modifying.html`