import json
import mimetypes
import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

s3_client = boto3.client(
    's3',
    region_name=os.environ.get('AWS_REGION', 'ap-south-1'),
    config=Config(
        signature_version='s3v4',
        s3={'addressing_style': 'virtual'}
    )
)
SOURCE_BUCKET = os.environ.get('SOURCE_BUCKET')


def lambda_handler(event, context):
    try:
        file_name = 'upload.jpg'

        # Check query parameters first.
        params = event.get('queryStringParameters') or {}
        if 'file_name' in params:
            file_name = params.get('file_name')

        # Fall back to checking the request body if sent as JSON.
        elif event.get('body'):
            body = event.get('body')
            if isinstance(body, str):
                body = json.loads(body)
            file_name = body.get('file_name', 'upload.jpg')

        output_format = (params.get('output_format') or 'jpeg').lower()
        quality = int(params.get('quality') or 85)
        max_dimension = int(params.get('max_dimension') or 800)

        if output_format not in ('webp', 'jpeg', 'png'):
            raise ValueError('output_format must be webp, jpeg, or png')
        if not 1 <= quality <= 100:
            raise ValueError('quality must be an integer from 1 to 100')
        if max_dimension <= 0:
            raise ValueError('max_dimension must be a positive integer')

        content_type = mimetypes.guess_type(file_name)[0] or 'application/octet-stream'

        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': SOURCE_BUCKET,
                'Key': file_name,
                'ContentType': content_type,
                'Metadata': {
                    'output-format': output_format,
                    'quality': str(quality),
                    'max-dimension': str(max_dimension),
                },
            },
            ExpiresIn=300
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            'body': json.dumps({
                'upload_url': presigned_url,
                'file_name': file_name
            })
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    except (TypeError, ValueError, json.JSONDecodeError) as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }