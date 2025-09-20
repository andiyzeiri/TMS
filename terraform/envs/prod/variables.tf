# General Configuration
variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "tms"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.1.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.1.1.0/24", "10.1.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.1.10.0/24", "10.1.20.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = ["10.1.50.0/24", "10.1.60.0/24"]
}

variable "app_port" {
  description = "Port on which the application runs"
  type        = number
  default     = 8000
}

# RDS Configuration
variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.4"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage in GBs"
  type        = number
  default     = 100
}

variable "rds_max_allocated_storage" {
  description = "Maximum allocated storage for autoscaling in GBs"
  type        = number
  default     = 1000
}

variable "database_name" {
  description = "Name of the database"
  type        = string
  default     = "tmsdb"
}

variable "database_username" {
  description = "Username for the database"
  type        = string
  default     = "tmsuser"
}

variable "database_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "rds_backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "rds_performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = true
}

variable "rds_monitoring_interval" {
  description = "Enhanced monitoring interval in seconds"
  type        = number
  default     = 60
}

variable "rds_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "rds_skip_final_snapshot" {
  description = "Skip final snapshot when destroying"
  type        = bool
  default     = false
}

variable "rds_create_read_replica" {
  description = "Create a read replica"
  type        = bool
  default     = true
}

variable "rds_read_replica_instance_class" {
  description = "Instance class for read replica"
  type        = string
  default     = "db.t3.small"
}

# ECS Configuration
variable "ecs_task_cpu" {
  description = "CPU units for the ECS task"
  type        = string
  default     = "1024"
}

variable "ecs_task_memory" {
  description = "Memory for the ECS task"
  type        = string
  default     = "2048"
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 3
}

variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 2
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 20
}

variable "image_tag" {
  description = "Tag for the Docker image"
  type        = string
  default     = "latest"
}

variable "log_retention_in_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

# S3 Configuration
variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["https://yourdomain.com"]
}

variable "create_web_bucket" {
  description = "Whether to create a bucket for web assets"
  type        = bool
  default     = true
}

# CloudFront Configuration
variable "web_domain_aliases" {
  description = "List of domain aliases for the web distribution"
  type        = list(string)
  default     = []
}

variable "api_domain_aliases" {
  description = "List of domain aliases for the API distribution"
  type        = list(string)
  default     = []
}

variable "web_acm_certificate_arn" {
  description = "ARN of the ACM certificate for web distribution"
  type        = string
  default     = null
}

variable "api_acm_certificate_arn" {
  description = "ARN of the ACM certificate for API distribution"
  type        = string
  default     = null
}

variable "cloudfront_price_class" {
  description = "Price class for CloudFront distribution"
  type        = string
  default     = "PriceClass_All"
}

# Secrets Configuration
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

variable "enable_secret_rotation" {
  description = "Enable automatic secret rotation"
  type        = bool
  default     = true
}