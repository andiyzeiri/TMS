# Generate random values for secrets
resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

# Database URL Secret
resource "aws_secretsmanager_secret" "database_url" {
  name        = "${var.name_prefix}-${var.environment}-database-url"
  description = "Database connection URL for ${var.name_prefix} ${var.environment}"

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-database-url"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = var.database_url
}

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "${var.name_prefix}-${var.environment}-jwt-secret"
  description = "JWT signing secret for ${var.name_prefix} ${var.environment}"

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-jwt-secret"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret != null ? var.jwt_secret : random_password.jwt_secret.result
}

# QuickBooks Client ID Secret
resource "aws_secretsmanager_secret" "qbo_client_id" {
  name        = "${var.name_prefix}-${var.environment}-qbo-client-id"
  description = "QuickBooks Online Client ID for ${var.name_prefix} ${var.environment}"

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-qbo-client-id"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "qbo_client_id" {
  secret_id     = aws_secretsmanager_secret.qbo_client_id.id
  secret_string = var.qbo_client_id
}

# QuickBooks Client Secret
resource "aws_secretsmanager_secret" "qbo_client_secret" {
  name        = "${var.name_prefix}-${var.environment}-qbo-client-secret"
  description = "QuickBooks Online Client Secret for ${var.name_prefix} ${var.environment}"

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-qbo-client-secret"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "qbo_client_secret" {
  secret_id     = aws_secretsmanager_secret.qbo_client_secret.id
  secret_string = var.qbo_client_secret
}

# Additional secrets for other integrations (optional)
resource "aws_secretsmanager_secret" "additional_secrets" {
  for_each = var.additional_secrets

  name        = "${var.name_prefix}-${var.environment}-${each.key}"
  description = each.value.description

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-${each.key}"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "additional_secrets" {
  for_each = var.additional_secrets

  secret_id     = aws_secretsmanager_secret.additional_secrets[each.key].id
  secret_string = each.value.value
}

# Secret rotation configuration (for production)
resource "aws_secretsmanager_secret_rotation" "database_password" {
  count = var.environment == "prod" && var.enable_secret_rotation ? 1 : 0

  secret_id           = aws_secretsmanager_secret.database_url.id
  rotation_lambda_arn = var.rotation_lambda_arn

  rotation_rules {
    automatically_after_days = 30
  }
}