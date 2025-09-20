# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.name_prefix}-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-ecs-task-execution-role"
    Environment = var.environment
  }
}

# Attach AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional policy for accessing Secrets Manager
resource "aws_iam_policy" "ecs_secrets_policy" {
  name        = "${var.name_prefix}-${var.environment}-ecs-secrets-policy"
  description = "Policy for ECS tasks to access Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = var.secrets_manager_arns
      }
    ]
  })

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-ecs-secrets-policy"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_secrets_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_policy.arn
}

# ECS Task Role (for application-level permissions)
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.name_prefix}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-ecs-task-role"
    Environment = var.environment
  }
}

# Policy for ECS tasks to access S3
resource "aws_iam_role_policy_attachment" "ecs_task_s3_policy" {
  count      = var.s3_access_policy_arn != null ? 1 : 0
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = var.s3_access_policy_arn
}

# Policy for ECS tasks to access CloudWatch Logs
resource "aws_iam_policy" "ecs_cloudwatch_policy" {
  name        = "${var.name_prefix}-${var.environment}-ecs-cloudwatch-policy"
  description = "Policy for ECS tasks to write to CloudWatch Logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/ecs/${var.name_prefix}-${var.environment}*"
      }
    ]
  })

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-ecs-cloudwatch-policy"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_cloudwatch_policy_attachment" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_cloudwatch_policy.arn
}

# ECR Repository
resource "aws_ecr_repository" "app" {
  name                 = "${var.name_prefix}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.name_prefix}-${var.environment}"
    Environment = var.environment
  }
}

# ECR Repository Policy
resource "aws_ecr_repository_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            aws_iam_role.ecs_task_execution_role.arn
          ]
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}

# ECR Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod", "production"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep last 5 development images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["dev", "development"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Delete untagged images older than 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# IAM User for CI/CD (optional)
resource "aws_iam_user" "cicd" {
  count = var.create_cicd_user ? 1 : 0
  name  = "${var.name_prefix}-${var.environment}-cicd-user"

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-cicd-user"
    Environment = var.environment
  }
}

# Policy for CI/CD user to push to ECR and update ECS
resource "aws_iam_policy" "cicd_policy" {
  count       = var.create_cicd_user ? 1 : 0
  name        = "${var.name_prefix}-${var.environment}-cicd-policy"
  description = "Policy for CI/CD to deploy to ECS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:RunTask"
        ]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          aws_iam_role.ecs_task_execution_role.arn,
          aws_iam_role.ecs_task_role.arn
        ]
      }
    ]
  })

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-cicd-policy"
    Environment = var.environment
  }
}

resource "aws_iam_user_policy_attachment" "cicd_policy_attachment" {
  count      = var.create_cicd_user ? 1 : 0
  user       = aws_iam_user.cicd[0].name
  policy_arn = aws_iam_policy.cicd_policy[0].arn
}

# Access keys for CI/CD user
resource "aws_iam_access_key" "cicd" {
  count = var.create_cicd_user ? 1 : 0
  user  = aws_iam_user.cicd[0].name
}