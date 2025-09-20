variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "secrets_manager_arns" {
  description = "List of Secrets Manager ARNs that ECS tasks need access to"
  type        = list(string)
  default     = []
}

variable "s3_access_policy_arn" {
  description = "ARN of the S3 access policy"
  type        = string
  default     = null
}

variable "create_cicd_user" {
  description = "Whether to create a CI/CD user with deployment permissions"
  type        = bool
  default     = false
}