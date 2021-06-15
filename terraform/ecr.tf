resource "aws_ecr_repository" "aix" {
  name = "aix"
}

output "aix-repo" {
  value = "${aws_ecr_repository.aix.repository_url}"
}
