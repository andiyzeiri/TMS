output "database_url_secret_arn" {
  description = "ARN of the DATABASE_URL secret"
  value       = aws_secretsmanager_secret.database_url.arn
}

output "jwt_secret_arn" {
  description = "ARN of the JWT secret"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "qbo_client_id_secret_arn" {
  description = "ARN of the QuickBooks client ID secret"
  value       = aws_secretsmanager_secret.qbo_client_id.arn
}

output "qbo_client_secret_arn" {
  description = "ARN of the QuickBooks client secret"
  value       = aws_secretsmanager_secret.qbo_client_secret.arn
}

output "additional_secret_arns" {
  description = "ARNs of additional secrets"
  value       = { for k, v in aws_secretsmanager_secret.additional_secrets : k => v.arn }
}

output "all_secret_arns" {
  description = "List of all secret ARNs"
  value = concat([
    aws_secretsmanager_secret.database_url.arn,
    aws_secretsmanager_secret.jwt_secret.arn,
    aws_secretsmanager_secret.qbo_client_id.arn,
    aws_secretsmanager_secret.qbo_client_secret.arn
  ], values(aws_secretsmanager_secret.additional_secrets)[*].arn)
}