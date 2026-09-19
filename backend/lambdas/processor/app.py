import json
import os
import urllib.parse
from datetime import datetime
from decimal import Decimal

import boto3

from analyzer import analyze_image, generate_ai_description
from optimizer import optimize_image

s3_client = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
DEST_BUCKET = os.environ["DEST_BUCKET"]
TABLE_NAME = os.environ["TABLE_NAME"]
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    print("Processor Lambda started")

    for record in event.get("Records", []):
        sqs_body = json.loads(record["body"])
        for s3_record in sqs_body.get("Records", []):
            source_bucket = s3_record["s3"]["bucket"]["name"]
            object_key = urllib.parse.unquote_plus(s3_record["s3"]["object"]["key"])
            print(f"Processing image {object_key} from bucket {source_bucket}")

            head = s3_client.head_object(Bucket=source_bucket, Key=object_key)
            image_obj = s3_client.get_object(Bucket=source_bucket, Key=object_key)
            image_content = image_obj["Body"].read()
            metadata = head.get("Metadata", {})
            output_format = metadata.get("output-format", "jpeg").lower()
            quality = int(metadata.get("quality", 85))
            max_dimension = int(metadata.get("max-dimension", 800))
            original_size = len(image_content)
            print(f"Original size: {original_size}")
            print(f"Optimization format: {output_format}, quality: {quality}, max dimension: {max_dimension}")

            optimization = optimize_image(
                image_content,
                output_format=output_format,
                quality=quality,
                max_dimension=max_dimension,
            )
            optimized_bytes = optimization["optimized_bytes"]
            optimized_size = len(optimized_bytes)
            image_id = object_key.rsplit(".", 1)[0]
            dest_key = f"processed_{image_id}.{optimization['file_extension']}"

            s3_client.put_object(
                Bucket=DEST_BUCKET,
                Key=dest_key,
                Body=optimized_bytes,
                ContentType=optimization["content_type"],
            )
            print(f"Optimized image stored at s3://{DEST_BUCKET}/{dest_key}")

            rekognition_labels = analyze_image(optimized_bytes)
            print(f"Rekognition labels: {rekognition_labels}")
            ai_caption = generate_ai_description(
                optimized_bytes,
                optimization["file_extension"],
                rekognition_labels,
            )
            print(f"AI description: {ai_caption}")

            reduction = Decimal("0")
            if original_size:
                reduction = Decimal(str(round((1 - optimized_size / original_size) * 100, 2)))

            table.put_item(Item={
                "ImageId": image_id,
                "OriginalFileName": object_key,
                "ProcessedFileName": dest_key,
                "SourceBucket": source_bucket,
                "DestinationBucket": DEST_BUCKET,
                "OutputFormat": optimization["actual_format"],
                "Quality": quality,
                "MaxDimension": max_dimension,
                "OriginalSize": original_size,
                "OptimizedSize": optimized_size,
                "SizeReductionPercent": reduction,
                "RekognitionLabels": rekognition_labels,
                "AiCaption": ai_caption,
                "ProcessingStatus": "COMPLETED",
                "UploadTimestamp": datetime.utcnow().isoformat(),
            })
            print(f"DynamoDB metadata stored; processing completed for {object_key}")

    return {"statusCode": 200, "body": json.dumps("Image processing complete")}
