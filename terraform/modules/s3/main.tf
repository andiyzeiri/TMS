# S3 Bucket for Document Storage
resource "aws_s3_bucket" "documents" {
  bucket = "${var.name_prefix}-${var.environment}-documents"

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-documents"
    Environment = var.environment
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "documents_lifecycle"
    status = "Enabled"

    # Transition to IA after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Transition to Glacier after 90 days
    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    # Transition to Deep Archive after 365 days
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }

    # Delete old versions after 90 days
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 365
    }

    # Delete incomplete multipart uploads after 7 days
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# S3 Bucket CORS Configuration
resource "aws_s3_bucket_cors_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 Bucket for Web Assets (if using S3 for static hosting)
resource "aws_s3_bucket" "web_assets" {
  count  = var.create_web_bucket ? 1 : 0
  bucket = "${var.name_prefix}-${var.environment}-web-assets"

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-web-assets"
    Environment = var.environment
  }
}

# Web Assets Bucket Versioning
resource "aws_s3_bucket_versioning" "web_assets" {
  count  = var.create_web_bucket ? 1 : 0
  bucket = aws_s3_bucket.web_assets[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

# Web Assets Bucket Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "web_assets" {
  count  = var.create_web_bucket ? 1 : 0
  bucket = aws_s3_bucket.web_assets[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Web Assets Bucket Public Access Configuration
resource "aws_s3_bucket_public_access_block" "web_assets" {
  count  = var.create_web_bucket ? 1 : 0
  bucket = aws_s3_bucket.web_assets[0].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Web Assets Bucket Policy (for CloudFront access)
resource "aws_s3_bucket_policy" "web_assets" {
  count  = var.create_web_bucket ? 1 : 0
  bucket = aws_s3_bucket.web_assets[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.web_assets[0].arn}/*"
      }
    ]
  })
}

# Web Assets Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "web_assets" {
  count  = var.create_web_bucket ? 1 : 0
  bucket = aws_s3_bucket.web_assets[0].id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# IAM Policy for ECS Tasks to access S3
data "aws_iam_policy_document" "s3_access" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:PutObjectAcl"
    ]
    resources = [
      "${aws_s3_bucket.documents.arn}/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.documents.arn
    ]
  }
}

resource "aws_iam_policy" "s3_access" {
  name        = "${var.name_prefix}-${var.environment}-s3-access"
  description = "Policy for ECS tasks to access S3 bucket"
  policy      = data.aws_iam_policy_document.s3_access.json

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-s3-access"
    Environment = var.environment
  }
}