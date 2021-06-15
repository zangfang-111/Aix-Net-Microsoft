# Workaround, allowing interpolation in variables
locals {
  azs = "${var.aws_region}a,${var.aws_region}b"
}
