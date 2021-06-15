variable "NAMESPACE" {
  type    = "string"
  default = "aix"
}

# User by templates/ecs/aix.json.tpl
variable "AWS_REGION" {
  type    = "string"
  default = "eu-central-1"
}

variable "aws_region" {
  type    = "string"
  default = "eu-central-1"
}

variable "CIDR_PRIVATE" {
  type    = "string"
  default = "10.0.1.0/24,10.0.2.0/24"
}

variable "CIDR_PUBLIC" {
  type    = "string"
  default = "10.0.101.0/24,10.0.102.0/24"
}

variable "CIDR_ELASTICACHE" {
  type    = "string"
  default = "10.0.31.0/24,10.0.32.0/24"
}

variable "key_name" {
  default = "aix-deployment"
}

variable "public_key" {
  default = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyTGqxz8dO26NKImBcrYwMVyXCnT3QWZkhPV+rI8E8xQf0qpaTNbdmxm5jQDAgojR+gSmKS527yFaxMwXlP+YEd5mYjQJN/h7ead6HTtf72RVb4cM76+HERoF/6inEtHckM8ZZDhaI3H6otPw7okZgnQFI2TdD1A2TI2cPmeZuBDgu6TqAkQ2qZ5IYii9k77p1LG8+ln/g+LmVo4dftZ0Y/v+dKc2B6DmvpVtyeUwBg4HG1oA5YdLFrnqLWkpyFnsprzLKmNc4vNlciuFPDXQiTKww500WkuDdWHJWRuGOzIj9/nr9dOU7RbNSTScChY/1pPX0IB4Knik3KDid597mQIDAQAB"
}

variable "aws_mq_username" {
  default = "root"
}

variable "aws_mq_password" {
  default = "M48mPdpEZdovfK"
}
