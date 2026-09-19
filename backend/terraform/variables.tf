# Placeholder for minimal configurable infrastructure variables.
variable "aws_region" {
  type    = string
  default = "ap-south-1" # Your target AWS region
}

variable "project_name" {
  type    = string
  default = "serverless-image-app-dev"
}
