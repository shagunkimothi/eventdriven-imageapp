# Placeholder for the future serverless image optimization infrastructure.
# --- 1. STORAGE & MESSAGING ---
resource "aws_s3_bucket" "source" {
  bucket = "${var.project_name}-source-${random_id.suffix.hex}"
}

resource "aws_s3_bucket_cors_configuration" "source" {
  bucket = aws_s3_bucket.source.id

  cors_rule {
    allowed_origins = ["http://localhost:5173", "http://localhost:5174"]
    allowed_methods = ["GET", "PUT", "HEAD"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket" "destination" {
  bucket = "${var.project_name}-dest-${random_id.suffix.hex}"
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_sqs_queue" "dlq" {
  name = "${var.project_name}-dlq"
}

resource "aws_sqs_queue" "queue" {
  name                       = "${var.project_name}-queue"
  visibility_timeout_seconds = 60
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })
}

# Allow S3 Source Bucket to send messages to the SQS Queue
resource "aws_sqs_queue_policy" "queue_policy" {
  queue_url = aws_sqs_queue.queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AllowS3ToSendMessage"
      Effect = "Allow"
      Principal = {
        Service = "s3.amazonaws.com"
      }
      Action   = "SQS:SendMessage"
      Resource = aws_sqs_queue.queue.arn
      Condition = {
        ArnEquals = {
          "aws:SourceArn" = aws_s3_bucket.source.arn
        }
      }
    }]
  })
}

# S3 Event Notification to SQS
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket     = aws_s3_bucket.source.id
  depends_on = [aws_sqs_queue_policy.queue_policy]

  queue {
    queue_arn = aws_sqs_queue.queue.arn
    events    = ["s3:ObjectCreated:*"]
  }
}

# --- 2. DATABASE ---
resource "aws_dynamodb_table" "metadata" {
  name         = "ImageMetadata"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "ImageId"

  attribute {
    name = "ImageId"
    type = "S"
  }
}

# --- 3. AUTHENTICATION (COGNITO) ---
resource "aws_cognito_user_pool" "pool" {
  name                     = "ImageAppUserPool"
  auto_verified_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "ImageAppClient"
  user_pool_id = aws_cognito_user_pool.pool.id
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

# --- 4. IAM ROLE & POLICIES FOR LAMBDAS ---
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = ["${aws_s3_bucket.source.arn}/*", "${aws_s3_bucket.destination.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:Query", "dynamodb:Scan", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.metadata.arn
      },
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.queue.arn
      },
      {
        Effect   = "Allow"
        Action   = ["rekognition:DetectLabels"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["bedrock:InvokeModel", "bedrock:Converse"]
        Resource = "*"
      }
    ]
  })
}

# --- 5. LAMBDA FUNCTIONS & ARCHIVES ---

# Presign Lambda
data "archive_file" "presign_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/presign"
  output_path = "${path.module}/presign.zip"
}

resource "aws_lambda_function" "presign" {
  filename         = data.archive_file.presign_zip.output_path
  function_name    = "PresignFunction"
  role             = aws_iam_role.lambda_role.arn
  handler          = "app.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.presign_zip.output_base64sha256

  environment {
    variables = {
      SOURCE_BUCKET = aws_s3_bucket.source.id
      TABLE_NAME    = aws_dynamodb_table.metadata.name
    }
  }
}

# Processor Lambda (Includes optimizer.py & analyzer.py)
data "archive_file" "processor_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/processor"
  output_path = "${path.module}/processor.zip"
}

resource "aws_lambda_function" "processor" {
  filename         = data.archive_file.processor_zip.output_path
  function_name    = "ProcessorFunction"
  role             = aws_iam_role.lambda_role.arn
  handler          = "app.lambda_handler"
  runtime          = "python3.11"
  timeout          = 120
  source_code_hash = data.archive_file.processor_zip.output_base64sha256

  environment {
    variables = {
      DEST_BUCKET = aws_s3_bucket.destination.id
      TABLE_NAME  = aws_dynamodb_table.metadata.name
    }
  }
}

# SQS Trigger Mapping for Processor Lambda
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.queue.arn
  function_name    = aws_lambda_function.processor.arn
  batch_size       = 1
}

# Images API Lambda
data "archive_file" "images_api_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/images_api"
  output_path = "${path.module}/images_api.zip"
}

resource "aws_lambda_function" "images_api" {
  filename         = data.archive_file.images_api_zip.output_path
  function_name    = "ImagesApiFunction"
  role             = aws_iam_role.lambda_role.arn
  handler          = "app.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.images_api_zip.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.metadata.name
    }
  }
}

# --- 6. API GATEWAY ---
resource "aws_apigatewayv2_api" "lambda_api" {
  name          = "ImageAppApi"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.lambda_api.id
  authorizer_type  = "JWT"
  authorizer_uri   = null
  identity_sources = ["$request.header.Authorization"]
  name             = "CognitoJWTAuthorizer"

  jwt_configuration {
    audience = [
      aws_cognito_user_pool_client.client.id
    ]

    issuer = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.pool.id}"
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.lambda_api.id
  name        = "Prod"
  auto_deploy = true
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "api_presign" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.presign.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_images" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.images_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda_api.execution_arn}/*/*"
}

# Routes
resource "aws_apigatewayv2_integration" "presign_integration" {
  api_id           = aws_apigatewayv2_api.lambda_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.presign.invoke_arn
}

resource "aws_apigatewayv2_route" "post_presign" {
  api_id             = aws_apigatewayv2_api.lambda_api.id
  route_key          = "POST /presign"
  target             = "integrations/${aws_apigatewayv2_integration.presign_integration.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "images_integration" {
  api_id           = aws_apigatewayv2_api.lambda_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.images_api.invoke_arn
}

resource "aws_apigatewayv2_route" "get_images" {
  api_id             = aws_apigatewayv2_api.lambda_api.id
  route_key          = "GET /images"
  target             = "integrations/${aws_apigatewayv2_integration.images_integration.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "delete_images" {
  api_id             = aws_apigatewayv2_api.lambda_api.id
  route_key          = "DELETE /images/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.images_integration.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}