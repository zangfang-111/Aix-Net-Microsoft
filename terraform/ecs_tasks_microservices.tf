data "template_file" "aix" {
  template = "${file("templates/ecs/aix.json.tpl")}"

  vars {
    REPOSITORY_URL = "${aws_ecr_repository.aix.repository_url}"
    AWS_REGION     = "${var.aws_region}"
    LOGS_GROUP     = "${aws_cloudwatch_log_group.aix.name}"
  }
}

data "aws_ecs_task_definition" "aix" {
  depends_on      = ["aws_ecs_task_definition.aix"]
  task_definition = "${aws_ecs_task_definition.aix.family}"
}

resource "aws_ecs_task_definition" "aix" {
  family = "aix"

  #  revision                 = "${max("${aws_ecs_task_definition.aix.revision}", "${data.aws_ecs_task_definition.aix.revision}") + 1}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024
  memory                   = 2048
  container_definitions    = "${data.template_file.aix.rendered}"
  execution_role_arn       = "${aws_iam_role.ecs_task_assume.arn}"
}

resource "aws_ecs_service" "aix" {
  name        = "aix"
  cluster     = "${aws_ecs_cluster.fargate.id}"
  launch_type = "FARGATE"

  # Track the latest ACTIVE revision
  task_definition = "${aws_ecs_task_definition.aix.family}:${max("${aws_ecs_task_definition.aix.revision}", "${data.aws_ecs_task_definition.aix.revision}")}"

  desired_count = 1

  network_configuration = {
    subnets         = ["${module.base_vpc.private_subnets[0]}"]
    security_groups = ["${aws_security_group.ecs.id}"]
  }

  load_balancer {
    target_group_arn = "${aws_alb_target_group.aix.arn}"
    container_name   = "aix"
    container_port   = 5000
  }

  depends_on = [
    "aws_alb_listener.aix",
  ]
}
