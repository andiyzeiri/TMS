# TMS Infrastructure with Terraform

This Terraform configuration provisions a complete AWS infrastructure for the Transportation Management System (TMS) application.

## Architecture Overview

- **VPC**: Multi-AZ setup with public/private subnets
- **RDS**: PostgreSQL with PostGIS extension, Multi-AZ deployment
- **ECS**: Fargate cluster running the API service
- **ALB**: Application Load Balancer with health checks on `/healthz`
- **S3**: Document storage with lifecycle policies
- **CloudFront**: CDN for web assets (or ECS for SSR)
- **Secrets Manager**: Secure storage for sensitive credentials
- **IAM**: Proper roles for ECS tasks, ECR access, and CloudWatch logging

## Directory Structure

```
terraform/
├── modules/
│   ├── vpc/
│   ├── rds/
│   ├── ecs/
│   ├── s3/
│   ├── cloudfront/
│   ├── iam/
│   └── secrets/
├── envs/
│   ├── dev/
│   └── prod/
└── README.md
```

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.0 installed
3. Docker images pushed to ECR (for API service)

## Environment Setup

### Development Environment

```bash
cd envs/dev
terraform init
terraform plan
terraform apply
```

### Production Environment

```bash
cd envs/prod
terraform init
terraform plan
terraform apply
```

## Environment-Specific Configuration

### Development
- Single AZ RDS (cost optimization)
- Smaller instance sizes
- Shorter backup retention
- Development-appropriate security groups

### Production
- Multi-AZ RDS with automated backups
- Larger, production-ready instance sizes
- Enhanced monitoring and logging
- Stricter security configurations

## Post-Deployment Steps

1. **Database Migrations**: The ECS task definition includes a migration job that runs `alembic upgrade head`

2. **Environment Variables**: Update the ECS service with your application-specific environment variables

3. **Domain Setup**: Configure your domain to point to the ALB endpoint

4. **SSL Certificate**: The ALB uses ACM certificates (configure your domain)

## Secrets Management

The following secrets are created in AWS Secrets Manager:

- `tms-database-url-{env}`: PostgreSQL connection string
- `tms-jwt-secret-{env}`: JWT signing secret
- `tms-qbo-credentials-{env}`: QuickBooks Online API credentials

Update these secrets through the AWS Console or CLI after deployment.

## Monitoring and Logging

- CloudWatch log groups for ECS tasks
- ALB access logs stored in S3
- RDS Enhanced Monitoring (production)
- CloudWatch alarms for critical metrics

## Security Features

- VPC with private subnets for database and ECS tasks
- Security groups with principle of least privilege
- IAM roles with minimal required permissions
- Secrets stored in AWS Secrets Manager
- ALB with security groups restricting access

## Cost Optimization

- Development environment uses smaller instances
- S3 lifecycle policies for document storage
- CloudWatch log retention policies
- Scheduled ECS tasks for migrations

## Troubleshooting

### Common Issues

1. **ECS Task Startup Issues**: Check CloudWatch logs for the ECS service
2. **Database Connection**: Verify security groups allow ECS → RDS communication
3. **Load Balancer Health Checks**: Ensure your app responds to `/healthz`
4. **Migration Failures**: Check the migration task logs in CloudWatch

### Useful Commands

```bash
# View ECS service logs
aws logs tail /ecs/tms-api-{env} --follow

# Check RDS connectivity
aws rds describe-db-instances --db-instance-identifier tms-{env}

# View secrets
aws secretsmanager get-secret-value --secret-id tms-database-url-{env}
```

## Cleanup

To destroy the infrastructure:

```bash
cd envs/{environment}
terraform destroy
```

**Warning**: This will permanently delete all resources including databases and S3 data. Ensure you have backups if needed.