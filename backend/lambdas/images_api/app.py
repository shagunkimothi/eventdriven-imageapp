import json
import os
import boto3


# AWS clients
dynamodb = boto3.resource("dynamodb")
s3_client = boto3.client("s3")


# Environment variables
TABLE_NAME = os.environ.get("TABLE_NAME")
DEST_BUCKET = os.environ.get("DEST_BUCKET")

table = dynamodb.Table(TABLE_NAME)


# CORS headers
headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,DELETE,OPTIONS"
}


def generate_presigned_url(bucket, key):
    """
    Generate a temporary URL for viewing an S3 object.
    """

    if not bucket or not key:
        return None

    try:
        return s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": bucket,
                "Key": key
            },
            ExpiresIn=3600
        )
    except Exception as e:
        print(
            f"Error generating presigned URL "
            f"for {bucket}/{key}: {str(e)}"
        )
        return None


def add_image_urls(item):
    """
    Add temporary URLs for the original and processed images.
    """

    original_bucket = item.get("SourceBucket")
    original_key = item.get("OriginalFileName")

    processed_bucket = (
        item.get("DestinationBucket")
        or DEST_BUCKET
    )
    processed_key = item.get("ProcessedFileName")

    item["OriginalImageUrl"] = generate_presigned_url(
        original_bucket,
        original_key
    )

    item["ProcessedImageUrl"] = generate_presigned_url(
        processed_bucket,
        processed_key
    )

    return item


def lambda_handler(event, context):

    # Support HTTP API and REST API event formats
    http_method = (
        event.get("httpMethod")
        or event.get("requestContext", {})
        .get("http", {})
        .get("method")
    )

    path_parameters = event.get("pathParameters") or {}

    try:

        # ---------------------------------------------------------
        # 1. CORS preflight
        # ---------------------------------------------------------

        if http_method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": headers,
                "body": ""
            }


        # ---------------------------------------------------------
        # 2. GET /images
        # ---------------------------------------------------------

        if http_method == "GET":

            items = []

            scan_kwargs = {}

            # Handle DynamoDB pagination
            while True:

                response = table.scan(
                    **scan_kwargs
                )

                items.extend(
                    response.get("Items", [])
                )

                last_key = response.get(
                    "LastEvaluatedKey"
                )

                if not last_key:
                    break

                scan_kwargs[
                    "ExclusiveStartKey"
                ] = last_key


            # Add temporary image URLs
            for item in items:
                add_image_urls(item)


            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(
                    items,
                    default=str
                )
            }


        # ---------------------------------------------------------
        # 3. DELETE /images/{id}
        # ---------------------------------------------------------

        if http_method == "DELETE":

            image_id = path_parameters.get("id")

            if not image_id:
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({
                        "error": "Missing image id"
                    })
                }


            # Get metadata from DynamoDB
            db_record = table.get_item(
                Key={
                    "ImageId": image_id
                }
            )

            item = db_record.get("Item")


            # Image doesn't exist
            if not item:
                return {
                    "statusCode": 404,
                    "headers": headers,
                    "body": json.dumps({
                        "error": "Image not found"
                    })
                }


            # -----------------------------------------------------
            # Delete original image
            # -----------------------------------------------------

            original_file = item.get(
                "OriginalFileName"
            )

            source_bucket = item.get(
                "SourceBucket"
            )

            if original_file and source_bucket:

                s3_client.delete_object(
                    Bucket=source_bucket,
                    Key=original_file
                )

                print(
                    f"Deleted original image: "
                    f"s3://{source_bucket}/{original_file}"
                )


            # -----------------------------------------------------
            # Delete processed image
            # -----------------------------------------------------

            processed_file = item.get(
                "ProcessedFileName"
            )

            destination_bucket = (
                item.get("DestinationBucket")
                or DEST_BUCKET
            )

            if processed_file and destination_bucket:

                s3_client.delete_object(
                    Bucket=destination_bucket,
                    Key=processed_file
                )

                print(
                    f"Deleted processed image: "
                    f"s3://{destination_bucket}/{processed_file}"
                )


            # -----------------------------------------------------
            # Delete DynamoDB metadata
            # -----------------------------------------------------

            table.delete_item(
                Key={
                    "ImageId": image_id
                }
            )

            print(
                f"Deleted DynamoDB metadata "
                f"for {image_id}"
            )


            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({
                    "message": (
                        f"Successfully deleted image "
                        f"{image_id}"
                    )
                })
            }


        # ---------------------------------------------------------
        # 4. Unsupported method
        # ---------------------------------------------------------

        return {
            "statusCode": 405,
            "headers": headers,
            "body": json.dumps({
                "error": "Method not allowed"
            })
        }


    except Exception as e:

        print(
            f"Images API error: {str(e)}"
        )

        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({
                "error": str(e)
            })
        }