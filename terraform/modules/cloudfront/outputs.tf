output "s3_distribution_id" {
  description = "ID of the S3 CloudFront distribution"
  value       = var.create_s3_distribution ? aws_cloudfront_distribution.s3_distribution[0].id : null
}

output "s3_distribution_arn" {
  description = "ARN of the S3 CloudFront distribution"
  value       = var.create_s3_distribution ? aws_cloudfront_distribution.s3_distribution[0].arn : null
}

output "s3_distribution_domain_name" {
  description = "Domain name of the S3 CloudFront distribution"
  value       = var.create_s3_distribution ? aws_cloudfront_distribution.s3_distribution[0].domain_name : null
}

output "s3_distribution_hosted_zone_id" {
  description = "Hosted zone ID of the S3 CloudFront distribution"
  value       = var.create_s3_distribution ? aws_cloudfront_distribution.s3_distribution[0].hosted_zone_id : null
}

output "alb_distribution_id" {
  description = "ID of the ALB CloudFront distribution"
  value       = var.create_alb_distribution ? aws_cloudfront_distribution.alb_distribution[0].id : null
}

output "alb_distribution_arn" {
  description = "ARN of the ALB CloudFront distribution"
  value       = var.create_alb_distribution ? aws_cloudfront_distribution.alb_distribution[0].arn : null
}

output "alb_distribution_domain_name" {
  description = "Domain name of the ALB CloudFront distribution"
  value       = var.create_alb_distribution ? aws_cloudfront_distribution.alb_distribution[0].domain_name : null
}

output "alb_distribution_hosted_zone_id" {
  description = "Hosted zone ID of the ALB CloudFront distribution"
  value       = var.create_alb_distribution ? aws_cloudfront_distribution.alb_distribution[0].hosted_zone_id : null
}