output "documents_bucket_id" {
  description = "ID of the documents S3 bucket"
  value       = aws_s3_bucket.documents.id
}

output "documents_bucket_arn" {
  description = "ARN of the documents S3 bucket"
  value       = aws_s3_bucket.documents.arn
}

output "documents_bucket_domain_name" {
  description = "Domain name of the documents S3 bucket"
  value       = aws_s3_bucket.documents.bucket_domain_name
}

output "web_assets_bucket_id" {
  description = "ID of the web assets S3 bucket"
  value       = var.create_web_bucket ? aws_s3_bucket.web_assets[0].id : null
}

output "web_assets_bucket_arn" {
  description = "ARN of the web assets S3 bucket"
  value       = var.create_web_bucket ? aws_s3_bucket.web_assets[0].arn : null
}

output "web_assets_bucket_domain_name" {
  description = "Domain name of the web assets S3 bucket"
  value       = var.create_web_bucket ? aws_s3_bucket.web_assets[0].bucket_domain_name : null
}

output "web_assets_bucket_website_endpoint" {
  description = "Website endpoint of the web assets S3 bucket"
  value       = var.create_web_bucket ? aws_s3_bucket_website_configuration.web_assets[0].website_endpoint : null
}

output "s3_access_policy_arn" {
  description = "ARN of the S3 access policy"
  value       = aws_iam_policy.s3_access.arn
}