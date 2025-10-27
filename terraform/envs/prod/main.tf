terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  # Uncomment and configure for remote state
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "tms/prod/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  name_prefix              = var.name_prefix
  environment              = var.environment
  vpc_cidr                 = var.vpc_cidr
  public_subnet_cidrs      = var.public_subnet_cidrs
  private_subnet_cidrs     = var.private_subnet_cidrs
  database_subnet_cidrs    = var.database_subnet_cidrs
  app_port                 = var.app_port
}

# Secrets Module
module "secrets" {
  source = "../../modules/secrets"

  name_prefix           = var.name_prefix
  environment           = var.environment
  database_url          = "postgresql://${var.database_username}:${var.database_password}@${module.rds.db_instance_endpoint}/${var.database_name}"
  qbo_client_id         = var.qbo_client_id
  qbo_client_secret     = var.qbo_client_secret
  enable_secret_rotation = var.enable_secret_rotation
}

# IAM Module
module "iam" {
  source = "../../modules/iam"

  name_prefix           = var.name_prefix
  environment           = var.environment
  aws_region            = var.aws_region
  aws_account_id        = data.aws_caller_identity.current.account_id
  secrets_manager_arns  = module.secrets.all_secret_arns
  s3_access_policy_arn  = module.s3.s3_access_policy_arn
  create_cicd_user      = true
}

# RDS Module
module "rds" {
  source = "../../modules/rds"

  name_prefix                    = var.name_prefix
  environment                    = var.environment
  postgres_version               = var.postgres_version
  instance_class                 = var.rds_instance_class
  allocated_storage              = var.rds_allocated_storage
  max_allocated_storage          = var.rds_max_allocated_storage
  database_name                  = var.database_name
  database_username              = var.database_username
  security_group_ids             = [module.vpc.rds_security_group_id]
  db_subnet_group_name           = module.vpc.database_subnet_group_name
  multi_az                       = var.rds_multi_az
  backup_retention_period        = var.rds_backup_retention_period
  performance_insights_enabled   = var.rds_performance_insights_enabled
  monitoring_interval            = var.rds_monitoring_interval
  deletion_protection            = var.rds_deletion_protection
  skip_final_snapshot            = var.rds_skip_final_snapshot
  create_read_replica            = var.rds_create_read_replica
  read_replica_instance_class    = var.rds_read_replica_instance_class
}

# S3 Module
module "s3" {
  source = "../../modules/s3"

  name_prefix       = var.name_prefix
  environment       = var.environment
  allowed_origins   = var.cors_allowed_origins
  create_web_bucket = var.create_web_bucket
}

# ECS Module
module "ecs" {
  source = "../../modules/ecs"

  name_prefix                   = var.name_prefix
  environment                   = var.environment
  vpc_id                        = module.vpc.vpc_id
  public_subnet_ids             = module.vpc.public_subnet_ids
  private_subnet_ids            = module.vpc.private_subnet_ids
  alb_security_group_id         = module.vpc.alb_security_group_id
  ecs_tasks_security_group_id   = module.vpc.ecs_tasks_security_group_id
  app_port                      = var.app_port
  task_cpu                      = var.ecs_task_cpu
  task_memory                   = var.ecs_task_memory
  desired_count                 = var.ecs_desired_count
  min_capacity                  = var.ecs_min_capacity
  max_capacity                  = var.ecs_max_capacity
  ecr_repository_url            = module.iam.ecr_repository_url
  image_tag                     = var.image_tag
  ecs_task_execution_role_arn   = module.iam.ecs_task_execution_role_arn
  ecs_task_role_arn            = module.iam.ecs_task_role_arn
  database_url_secret_arn       = module.secrets.database_url_secret_arn
  jwt_secret_arn               = module.secrets.jwt_secret_arn
  qbo_client_id_secret_arn     = module.secrets.qbo_client_id_secret_arn
  qbo_client_secret_arn        = module.secrets.qbo_client_secret_arn
  aws_region                   = var.aws_region
  log_retention_in_days        = var.log_retention_in_days
}

# CloudFront Module
module "cloudfront" {
  source = "../../modules/cloudfront"

  name_prefix               = var.name_prefix
  environment               = var.environment
  create_s3_distribution    = var.create_web_bucket
  create_alb_distribution   = true
  s3_bucket_id              = var.create_web_bucket ? module.s3.web_assets_bucket_id : null
  s3_bucket_arn             = var.create_web_bucket ? module.s3.web_assets_bucket_arn : null
  s3_bucket_domain_name     = var.create_web_bucket ? module.s3.web_assets_bucket_domain_name : null
  alb_dns_name              = module.ecs.alb_dns_name
  domain_aliases            = var.web_domain_aliases
  api_domain_aliases        = var.api_domain_aliases
  acm_certificate_arn       = var.web_acm_certificate_arn
  api_acm_certificate_arn   = var.api_acm_certificate_arn
  price_class               = var.cloudfront_price_class
  api_path_pattern          = "/api/*"
}