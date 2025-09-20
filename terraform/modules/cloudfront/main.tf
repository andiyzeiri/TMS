# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "main" {
  count = var.create_s3_distribution ? 1 : 0

  name                              = "${var.name_prefix}-${var.environment}-oac"
  description                       = "OAC for ${var.name_prefix} ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution for S3 (Web Assets)
resource "aws_cloudfront_distribution" "s3_distribution" {
  count = var.create_s3_distribution ? 1 : 0

  origin {
    domain_name              = var.s3_bucket_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main[0].id
    origin_id                = "S3-${var.s3_bucket_id}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.name_prefix} ${var.environment} S3 Distribution"
  default_root_object = "index.html"

  aliases = var.domain_aliases

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.s3_bucket_id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Cache behavior for API routes (if using SSR)
  dynamic "ordered_cache_behavior" {
    for_each = var.api_path_pattern != null ? [1] : []
    content {
      path_pattern     = var.api_path_pattern
      allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods   = ["GET", "HEAD", "OPTIONS"]
      target_origin_id = "S3-${var.s3_bucket_id}"

      forwarded_values {
        query_string = true
        headers      = ["Authorization", "CloudFront-Forwarded-Proto"]

        cookies {
          forward = "all"
        }
      }

      min_ttl                = 0
      default_ttl            = 0
      max_ttl                = 0
      compress               = true
      viewer_protocol_policy = "redirect-to-https"
    }
  }

  price_class = var.price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-s3-distribution"
    Environment = var.environment
  }

  viewer_certificate {
    cloudfront_default_certificate = var.acm_certificate_arn == null
    acm_certificate_arn           = var.acm_certificate_arn
    ssl_support_method            = var.acm_certificate_arn != null ? "sni-only" : null
    minimum_protocol_version      = var.acm_certificate_arn != null ? "TLSv1.2_2021" : null
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

# CloudFront Distribution for ALB (ECS)
resource "aws_cloudfront_distribution" "alb_distribution" {
  count = var.create_alb_distribution ? 1 : 0

  origin {
    domain_name = var.alb_dns_name
    origin_id   = "ALB-${var.name_prefix}-${var.environment}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "${var.name_prefix} ${var.environment} ALB Distribution"

  aliases = var.api_domain_aliases

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "ALB-${var.name_prefix}-${var.environment}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["*"]

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # Cache behavior for static assets
  ordered_cache_behavior {
    path_pattern     = "/static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${var.name_prefix}-${var.environment}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = var.price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "${var.name_prefix}-${var.environment}-alb-distribution"
    Environment = var.environment
  }

  viewer_certificate {
    cloudfront_default_certificate = var.api_acm_certificate_arn == null
    acm_certificate_arn           = var.api_acm_certificate_arn
    ssl_support_method            = var.api_acm_certificate_arn != null ? "sni-only" : null
    minimum_protocol_version      = var.api_acm_certificate_arn != null ? "TLSv1.2_2021" : null
  }
}

# S3 Bucket Policy to allow CloudFront access
resource "aws_s3_bucket_policy" "cloudfront_oac" {
  count  = var.create_s3_distribution ? 1 : 0
  bucket = var.s3_bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${var.s3_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.s3_distribution[0].arn
          }
        }
      }
    ]
  })
}