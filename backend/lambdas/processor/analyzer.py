import io
import os
from decimal import Decimal

import boto3
from botocore.config import Config
from PIL import Image

rekognition_client = boto3.client(
    'rekognition',
    region_name=os.environ.get('AWS_REGION', 'ap-south-1')
)
bedrock_runtime = boto3.client(
    'bedrock-runtime',
    region_name=os.environ.get('AWS_REGION', 'ap-south-1'),
    config=Config(read_timeout=30, connect_timeout=5, retries={'max_attempts': 2})
)

NOVA_MODEL_ID = 'global.amazon.nova-2-lite-v1:0'


def analyze_image(image_bytes, max_labels=6, min_confidence=75):
    # Rekognition accepts JPEG/PNG reliably; convert WebP in memory only.
    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            if image.format == 'WEBP':
                converted = io.BytesIO()
                image.convert('RGB').save(converted, format='JPEG')
                image_bytes = converted.getvalue()
    except Exception as error:
        print(f'Rekognition image preparation error: {error}')

    response = rekognition_client.detect_labels(
        Image={'Bytes': image_bytes},
        MaxLabels=max_labels,
        MinConfidence=min_confidence
    )
    return [
        {
            'name': label['Name'],
            'confidence': Decimal(str(round(label['Confidence'], 2)))
        }
        for label in response.get('Labels', [])
    ]


def generate_ai_description(image_bytes, image_format, rekognition_labels):
    prompt = (
        'You are an image analysis assistant for a serverless image optimization '
        'application. Describe the provided image in one concise, factual sentence. '
        'Mention the main visible subject or scene and important visual context. '
        'Do not identify people by name. Do not invent details. Return only the '
        'one-sentence description.'
    )
    if rekognition_labels:
        prompt += ' Detected labels for context: ' + ', '.join(
            label['name'] for label in rekognition_labels
        ) + '.'

    image_format = str(image_format).lower().strip()
    if image_format == 'jpg':
        image_format = 'jpeg'
    if image_format not in {'jpeg', 'png', 'webp', 'gif'}:
        raise ValueError(
            f'Unsupported Nova image format: {image_format}. '
            'Expected jpeg, png, webp, or gif.'
        )

    try:
        response = bedrock_runtime.converse(
            modelId=NOVA_MODEL_ID,
            messages=[{
                'role': 'user',
                'content': [
                    {'text': prompt},
                    {'image': {
                        'format': image_format,
                        'source': {'bytes': image_bytes}
                    }}
                ]
            }],
            inferenceConfig={'maxTokens': 120, 'temperature': 0.2}
        )
        content = response.get('output', {}).get('message', {}).get('content', [])
        caption = next((item.get('text', '').strip() for item in content if item.get('text')), '')
        return caption or 'AI description unavailable.'
    except Exception as error:
        print(f'Nova 2 Lite invocation error: {error}')
        return 'AI description unavailable.'
