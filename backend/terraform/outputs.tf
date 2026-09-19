# Placeholder for useful infrastructure outputs.
output "api_url" {
  description = "API Gateway endpoint URL for Prod stage"
  value       = "${aws_apigatewayv2_api.lambda_api.api_endpoint}/Prod"
}

output "source_bucket_name" {
  description = "S3 Source Bucket Name"
  value       = aws_s3_bucket.source.id
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.pool.id
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.client.id
}