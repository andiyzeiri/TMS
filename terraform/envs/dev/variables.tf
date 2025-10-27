# General Configuration
variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "tms"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
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
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = ["10.0.50.0/24", "10.0.60.0/24"]
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
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage in GBs"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "Maximum allocated storage for autoscaling in GBs"
  type        = number
  default     = 100
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
  default     = "changeme123!"
}

# ECS Configuration
variable "ecs_task_cpu" {
  description = "CPU units for the ECS task"
  type        = string
  default     = "256"
}

variable "ecs_task_memory" {
  description = "Memory for the ECS task"
  type        = string
  default     = "512"
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 5
}

variable "image_tag" {
  description = "Tag for the Docker image"
  type        = string
  default     = "latest"
}

variable "log_retention_in_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 7
}

# S3 Configuration
variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "create_web_bucket" {
  description = "Whether to create a bucket for web assets"
  type        = bool
  default     = false
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

# Secrets Configuration
variable "qbo_client_id" {
  description = "QuickBooks Online Client ID"
  type        = string
  sensitive   = true
  default     = "your-qbo-client-id"
}

variable "qbo_client_secret" {
  description = "QuickBooks Online Client Secret"
  type        = string
  sensitive   = true
  default     = "your-qbo-client-secret"
}