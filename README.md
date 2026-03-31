# ☁️ Serverless Event-Driven Image Processing Application

A serverless web application for uploading, storing, and automatically processing images using AWS cloud services. Users can upload images via a frontend interface — the system handles storage, processing, and metadata logging automatically with zero server management.

---

## 🏗️ Architecture

```
[Frontend (HTML/JS)]
        |
        v
[API Gateway Endpoint] <---> [AWS Lambda - Upload Function]
        |
        v
[Amazon S3 - Raw Bucket]
        |
        v  (S3 Event Trigger)
[AWS Lambda - Processing Function]
        |
        v
[Amazon S3 - Processed Bucket]
        |
        v
[Amazon DynamoDB - Metadata Storage]
```

### Flow
1. User uploads an image via the web interface
2. Image is stored in the **S3 raw bucket**
3. S3 event triggers **Lambda** for processing (resize, compress, format change)
4. Processed image is stored in the **S3 processed bucket**
5. Image metadata (ID, timestamp, S3 URL) is saved to **DynamoDB**
6. **API Gateway** handles all frontend-backend communication

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Serverless Backend | AWS Lambda (Python) |
| API | AWS API Gateway (REST) |
| Storage | Amazon S3 (Raw + Processed Buckets) |
| Database | Amazon DynamoDB |
| Security | AWS IAM Roles & Policies |
| Event Messaging | AWS SNS / SQS |
| Testing | Postman |
| IDE | VS Code |

---

## ⚙️ AWS Services Setup

### S3 — Two Buckets
- `raw-image-bucket` — stores original user uploads
- `processed-image-bucket` — stores processed/output images
- CORS and permissions configured for Lambda triggers

### Lambda — Upload Function
Generates a presigned S3 URL and saves image metadata to DynamoDB.

```python
import json, boto3, os, time, uuid

s3 = boto3.client('s3')
BUCKET = os.environ.get("RAW_BUCKET", "raw-image-bucket")

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get("DDB_TABLE", "ImagesMetadata"))

def lambda_handler(event, context):
    filename = f"upload-{int(time.time())}.jpg"
    imgid = str(uuid.uuid4())
    timestamp = str(int(time.time()))

    url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': BUCKET, 'Key': filename, 'ContentType': 'image/jpeg'},
        ExpiresIn=300
    )

    userid = event.get('userid', 'anonymous')

    table.put_item(Item={
        'imgid': imgid,
        'timestamp': timestamp,
        'filename': filename,
        'userid': userid,
        'url': f"https://{BUCKET}.s3.amazonaws.com/{filename}"
    })

    return {
        'statusCode': 200,
        'headers': {"Access-Control-Allow-Origin": "*"},
        'body': json.dumps({"uploadURL": url, "filename": filename, "imgid": imgid})
    }
```

### Lambda — Processing Function
Triggered by S3 upload events; copies image to processed bucket and logs metadata.

```python
import boto3, os
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DDB_TABLE'])
PROCESSED_BUCKET = os.environ['PROCESSED_BUCKET']

def lambda_handler(event, context):
    for record in event['Records']:
        source_bucket = record['s3']['bucket']['name']
        object_key = record['s3']['object']['key']

        s3.copy_object(
            Bucket=PROCESSED_BUCKET,
            Key=object_key,
            CopySource={'Bucket': source_bucket, 'Key': object_key}
        )

        table.put_item(Item={
            'imageId': object_key,
            'timestamp': datetime.utcnow().isoformat()
        })

    return {"status": "done"}
```

### DynamoDB — ImagesMetadata Table
| Attribute | Type | Role |
|---|---|---|
| `imgid` | String | Partition Key |
| `timestamp` | String | Sort Key |
| `filename` | String | Image file name |
| `userid` | String | GSI: userindex |
| `url` | String | GSI: urlindex |

### API Gateway
- REST API with a **POST `/upload`** endpoint
- CORS enabled for frontend access
- Integrated with the Upload Lambda function
- Deployed endpoint: `https://tn186zpgwk.execute-api.ap-south-1.amazonaws.com/prod/upload`

---

## 🎯 Objectives

- ✅ Web interface for image uploads
- ✅ Serverless image storage via Amazon S3
- ✅ Automatic image handling triggered by S3 events
- ✅ Image metadata tracked in DynamoDB
- ✅ REST API endpoints via API Gateway
- ✅ Scalable, secure, and cost-efficient — no server management

---

## 📋 Current Limitations

- The processing Lambda currently **does not transform images** (no resize, filter, or watermark)
- The "processed" image is identical to the raw image at this stage
- Image transformation (using Pillow/PIL) is planned as a future enhancement

---

## 🚀 Future Enhancements

- [ ] Add actual image transformations (resize, compress, format conversion) using Pillow
- [ ] Add a gallery page to browse processed images
- [ ] Add user authentication via AWS Cognito
- [ ] Add CloudFront CDN for faster image delivery
- [ ] Add image deletion support

---

## 📁 Project Structure

```
├── lambda/
│   ├── upload_handler.py       # Presigned URL generation + metadata save
│   └── process_handler.py      # S3 event triggered processing
├── frontend/
│   └── index.html              # Upload UI (HTML/CSS/JS)
└── README.md
```

---

## 👤 Author

**Shagun Kimothi**  
Cloud Computing Project — AWS Serverless Architecture
