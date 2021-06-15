# Configure the AWS Provider
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "${var.aws_region}"
}

terraform {
  backend "s3" {
    bucket = "aix-next-terraform-state"
    key    = "state/aix.tfstate"
    region = "eu-central-1"
  }
}

resource "aws_key_pair" "deployer" {
  key_name   = "${var.key_name}"
  public_key = "${var.public_key}"
}

resource "aws_mq_configuration" "aix" {
  description    = "Example Configuration"
  name           = "aix-queue"
  engine_type    = "ActiveMQ"
  engine_version = "5.15.0"

  data = <<DATA
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<broker xmlns="http://activemq.apache.org/schema/core">
  <plugins>
    <forcePersistencyModeBrokerPlugin persistenceFlag="true"/>
    <statisticsBrokerPlugin/>
    <timeStampingBrokerPlugin ttlCeiling="86400000" zeroExpirationOverride="86400000"/>
  </plugins>
</broker>
DATA
}

resource "aws_mq_broker" "aix" {
  broker_name = "aix"

  configuration {
    id       = "${aws_mq_configuration.aix.id}"
    revision = "${aws_mq_configuration.aix.latest_revision}"
  }

  engine_type        = "ActiveMQ"
  engine_version     = "5.15.0"
  host_instance_type = "mq.t2.micro"

  security_groups = [
    "${aws_security_group.mq.id}",
    "${aws_security_group.ecs.id}",
  ]

  subnet_ids = [
    "${module.base_vpc.public_subnets[0]}",
  ]

  user {
    username = "${var.aws_mq_username}"
    password = "${var.aws_mq_password}"
  }
}
