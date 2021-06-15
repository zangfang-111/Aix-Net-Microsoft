// Generate a random string for auth token, no special chars
resource "random_string" "auth_token" {
  length  = 64
  special = false
}

module "redis" {
  source          = "git::https://github.com/cloudposse/terraform-aws-elasticache-redis.git?ref=master"
  name            = "redis"
  security_groups = ["${aws_security_group.ecs.id}"]

  auth_token         = "${random_string.auth_token.result}"
  vpc_id             = "${module.base_vpc.vpc_id}"
  subnets            = ["${module.base_vpc.elasticache_subnets}"]
  maintenance_window = "sun:23:30-mon:00:30"
  cluster_size       = "2"
  instance_type      = "cache.t2.small"
  engine_version     = "4.0.10"
  apply_immediately  = "true"
  availability_zones = ["${split(",", local.azs)}"]

  automatic_failover = "false"
}

output "auth_token" {
  value = "${random_string.auth_token.result}"
}
