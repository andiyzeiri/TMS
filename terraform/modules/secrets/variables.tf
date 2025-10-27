variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (will be generated if not provided)"
  type        = string
  default     = null
  sensitive   = true
}

variable "qbo_client_id" {
  description = "QuickBooks Online Client ID"
  type        = string
  sensitive   = true
}

variable "qbo_client_secret" {
  description = "QuickBooks Online Client Secret"
  type        = string
  sensitive   = true
}

variable "additional_secrets" {
  description = "Additional secrets to create"
  type = map(object({
    description = string
    value       = string
  }))
  default   = {}
  sensitive = true
}

variable "enable_secret_rotation" {
  description = "Enable automatic secret rotation for production"
  type        = bool
  default     = false
}

variable "rotation_lambda_arn" {
  description = "ARN of Lambda function for secret rotation"
  type        = string
  default     = null
}