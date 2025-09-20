# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

# RDS Outputs
output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_instance_endpoint
}

output "database_port" {
  description = "RDS instance port"
  value       = module.rds.db_instance_port
}

output "read_replica_endpoint" {
  description = "Read replica endpoint"
  value       = module.rds.read_replica_endpoint
}

# ECS Outputs
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.ecs.alb_dns_name
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.ecs_cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.ecs_service_name
}

# CloudFront Outputs
output "cloudfront_distribution_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.alb_distribution_domain_name
}

output "web_cloudfront_distribution_domain_name" {
  description = "Domain name of the web CloudFront distribution"
  value       = module.cloudfront.s3_distribution_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.alb_distribution_id
}

output "web_cloudfront_distribution_id" {
  description = "ID of the web CloudFront distribution"
  value       = module.cloudfront.s3_distribution_id
}

# S3 Outputs
output "documents_bucket_name" {
  description = "Name of the documents S3 bucket"
  value       = module.s3.documents_bucket_id
}

output "web_assets_bucket_name" {
  description = "Name of the web assets S3 bucket"
  value       = module.s3.web_assets_bucket_id
}

# IAM Outputs
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.iam.ecr_repository_url
}

output "cicd_user_name" {
  description = "Name of the CI/CD user"
  value       = module.iam.cicd_user_name
}

# Sensitive outputs for CI/CD
output "cicd_access_key_id" {
  description = "Access key ID for CI/CD user"
  value       = module.iam.cicd_access_key_id
  sensitive   = true
}

output "cicd_secret_access_key" {
  description = "Secret access key for CI/CD user"
  value       = module.iam.cicd_secret_access_key
  sensitive   = true
}

# Migration task definition
output "migration_task_definition_arn" {
  description = "ARN of the migration task definition"
  value       = module.ecs.migration_task_definition_arn
}