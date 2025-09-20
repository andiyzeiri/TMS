variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "create_s3_distribution" {
  description = "Whether to create CloudFront distribution for S3"
  type        = bool
  default     = false
}

variable "create_alb_distribution" {
  description = "Whether to create CloudFront distribution for ALB"
  type        = bool
  default     = true
}

variable "s3_bucket_id" {
  description = "ID of the S3 bucket"
  type        = string
  default     = null
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
  default     = null
}

variable "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  type        = string
  default     = null
}

variable "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  type        = string
  default     = null
}

variable "domain_aliases" {
  description = "List of domain aliases for the S3 distribution"
  type        = list(string)
  default     = []
}

variable "api_domain_aliases" {
  description = "List of domain aliases for the ALB distribution"
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for S3 distribution"
  type        = string
  default     = null
}

variable "api_acm_certificate_arn" {
  description = "ARN of the ACM certificate for ALB distribution"
  type        = string
  default     = null
}

variable "price_class" {
  description = "Price class for CloudFront distribution"
  type        = string
  default     = "PriceClass_100"

  validation {
    condition = contains([
      "PriceClass_All",
      "PriceClass_200",
      "PriceClass_100"
    ], var.price_class)
    error_message = "Price class must be PriceClass_All, PriceClass_200, or PriceClass_100."
  }
}

variable "api_path_pattern" {
  description = "Path pattern for API routes (e.g., '/api/*')"
  type        = string
  default     = null
}