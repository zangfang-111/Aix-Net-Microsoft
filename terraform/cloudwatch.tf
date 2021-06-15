resource "aws_cloudwatch_log_group" "aix" {
  name              = "/ecs/aix"
  retention_in_days = 30

  tags {
    Name = "aix"
  }
}
