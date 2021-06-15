#!/bin/bash
# Setup dependencies.
mkdir -p ~/bin
cd ~/bin
export PATH="$PATH:/root/bin"
apt-get update && apt-get install -y python-pip libpython-dev unzip git

# Dependency: Terraform.
wget https://releases.hashicorp.com/terraform/0.11.7/terraform_0.11.7_linux_amd64.zip
unzip terraform_0.11.7_linux_amd64.zip

# Dependency: AWS CLI
pip install awscli
aws s3 cp s3://${AWS_S3_BUCKET}/terraform/access.tf ${BITBUCKET_CLONE_DIR}/terraform/access.tf
aws s3 cp s3://${AWS_S3_BUCKET}/terraform/aix-next-deployment.pem ${BITBUCKET_CLONE_DIR}/terraform/aix-next-deployment.pem
aws s3 cp s3://${AWS_S3_BUCKET}/terraform/aix-next-deployment_pub.pem  ${BITBUCKET_CLONE_DIR}/terraform/aix-next-deployment_pub.pem

# copy the same keys to standard system to be able to push to git repo
cp ${BITBUCKET_CLONE_DIR}/terraform/aix-next-deployment.pem ~/.ssh/id_rsa
ssh-keygen -f ${BITBUCKET_CLONE_DIR}/terraform/aix-next-deployment_pub.pem -i -mPKCS8 > ~/.ssh/id_rsa.pub
chmod 400 ~/.ssh/id_rsa.pub
chmod 400 ~/.ssh/id_rsa

# git tag & autoversening
git config --global user.email "cristin.iosif@heron.ai"
git config --global user.name "Bitbucket pipeline"
cd ${BITBUCKET_CLONE_DIR}
VERSION=$(npm version patch -m "%s [skip CI]")
VERSION=$(echo $VERSION | cut -c 2-)
git tag $VERSION-${BITBUCKET_BRANCH}
echo $VERSION is the latest version
git push origin ${BITBUCKET_BRANCH}
git push origin --tags

# Build docker with version tag
aws s3 cp s3://${AWS_S3_BUCKET}/env-vars/env-${AWS_ENV} ${BITBUCKET_CLONE_DIR}/.env
docker build -t ${AWS_ECS_SERVICE_NAME}:$VERSION .
cd ${BITBUCKET_CLONE_DIR}/ && docker build -t ${AWS_ECS_SERVICE_NAME}:latest .
docker tag ${AWS_ECS_SERVICE_NAME}:latest ${AWS_ECS_SERVICE_NAME}:$VERSION

# Push image to ECR
aws ecr get-login --no-include-email --region eu-central-1 | /bin/bash
aws ecr describe-repositories --region eu-central-1
docker tag ${AWS_ECS_SERVICE_NAME}:$VERSION ${AWS_ECR_ID}.dkr.ecr.eu-central-1.amazonaws.com/${AWS_ECS_SERVICE_NAME}:$VERSION
docker tag ${AWS_ECS_SERVICE_NAME}:$VERSION ${AWS_ECR_ID}.dkr.ecr.eu-central-1.amazonaws.com/${AWS_ECS_SERVICE_NAME}:latest
docker push ${AWS_ECR_ID}.dkr.ecr.eu-central-1.amazonaws.com/${AWS_ECS_SERVICE_NAME}:$VERSION
docker push ${AWS_ECR_ID}.dkr.ecr.eu-central-1.amazonaws.com/${AWS_ECS_SERVICE_NAME}:latest
# update the ECS service with forceNewDeployment always latest version
aws ecs update-service --region eu-central-1 --cluster fargate --service ${AWS_ECS_SERVICE_NAME} --task-definition ${AWS_ECS_SERVICE_NAME} --desired-count 1 --force-new-deployment
# Provision Terraform resources.
cd ${BITBUCKET_CLONE_DIR}/terraform
# terraform init
# terraform import aws_key_pair.deployer aix-deployment | true
# terraform import aws_ecr_repository.service aix-ecr-repository | true
# terraform refresh

# Ensure Terraform syntax is valid before proceeding.
# terraform validate

# Ensure this step passes so that the state is always pushed.
# terraform apply -auto-approve