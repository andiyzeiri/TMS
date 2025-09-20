output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.app.arn
}

output "cicd_user_name" {
  description = "Name of the CI/CD user"
  value       = var.create_cicd_user ? aws_iam_user.cicd[0].name : null
}

output "cicd_access_key_id" {
  description = "Access key ID for the CI/CD user"
  value       = var.create_cicd_user ? aws_iam_access_key.cicd[0].id : null
  sensitive   = true
}

output "cicd_secret_access_key" {
  description = "Secret access key for the CI/CD user"
  value       = var.create_cicd_user ? aws_iam_access_key.cicd[0].secret : null
  sensitive   = true
}