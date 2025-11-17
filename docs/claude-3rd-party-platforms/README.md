# Claude on 3rd-Party Platforms

Complete guide to accessing Anthropic's Claude models through Amazon Bedrock, Google Vertex AI, and other cloud platforms.

## Table of Contents

1. [Amazon Bedrock](#amazon-bedrock)
2. [Google Vertex AI](#google-vertex-ai)
3. [Quick Comparison](#quick-comparison)
4. [Model Availability](#model-availability)
5. [Best Practices](#best-practices)

## Amazon Bedrock

### Overview

Anthropic's Claude models are available through Amazon Bedrock, AWS's fully managed service for accessing foundation models.

### Setup

#### 1. Install AWS CLI (v2.13.23+)

```bash
# Install or upgrade AWS CLI
pip install --upgrade awscli

# Verify installation
aws --version
```

#### 2. Configure AWS Credentials

```bash
# Interactive configuration
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-west-2"

# Verify credentials
aws sts get-caller-identity
```

#### 3. Install SDK

**Option A: Using Anthropic's SDK**
```bash
pip install -U "anthropic[bedrock]"
```

**Option B: Using AWS SDK (Boto3)**
```bash
pip install boto3>=1.28.59
```

**Option C: Using TypeScript**
```bash
npm install @anthropic-ai/bedrock-sdk
```

#### 4. Enable Model Access

1. Go to [AWS Console > Bedrock > Model Access](https://console.aws.amazon.com/bedrock/home?region=us-west-2#/modelaccess)
2. Request access to Anthropic models
3. Wait for access approval (usually immediate)

### Available Models

| Model | Bedrock Model ID | Regions |
|-------|------------------|---------|
| Claude Sonnet 4.5 | `anthropic.claude-sonnet-4-5-20250929-v1:0` | Global, US, EU, JP |
| Claude Sonnet 4 | `anthropic.claude-sonnet-4-20250514-v1:0` | Global, US, EU, APAC |
| Claude Haiku 4.5 | `anthropic.claude-haiku-4-5-20251001-v1:0` | Global, US, EU |
| Claude Opus 4.1 | `anthropic.claude-opus-4-1-20250805-v1:0` | US only |

**Note:** Use `global.` prefix for global endpoints (no data residency guarantee). Remove prefix for regional endpoints (10% premium, data residency guaranteed).

### Example: Python with Anthropic SDK

```python
from anthropic import AnthropicBedrock

# Initialize client
client = AnthropicBedrock(
    aws_access_key="your-access-key",      # Or use AWS_ACCESS_KEY_ID env var
    aws_secret_key="your-secret-key",      # Or use AWS_SECRET_ACCESS_KEY env var
    aws_session_token="optional-token",    # For temporary credentials
    aws_region="us-west-2"
)

# Make a request
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content[0].text)
```

### Example: TypeScript with Bedrock SDK

```typescript
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

const client = new AnthropicBedrock({
  awsAccessKey: 'your-access-key',
  awsSecretKey: 'your-secret-key',
  awsSessionToken: 'optional-token',
  awsRegion: 'us-west-2'
});

async function main() {
  const message = await client.messages.create({
    model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    max_tokens: 256,
    messages: [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  });

  console.log(message.content[0].type === 'text' ? message.content[0].text : '');
}

main().catch(console.error);
```

### Example: Python with Boto3

```python
import boto3
import json

bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-west-2")

response = bedrock.invoke_model(
    modelId="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    body=json.dumps({
        "max_tokens": 256,
        "messages": [
            {"role": "user", "content": "Hello, Claude!"}
        ],
        "anthropic_version": "bedrock-2023-05-31"
    })
)

response_body = json.loads(response.get("body").read())
print(response_body["content"][0]["text"])
```

### Activity Logging

Enable CloudWatch logging for compliance and debugging:

```python
import boto3

bedrock = boto3.client(service_name="bedrock")

# Enable logging
response = bedrock.put_model_invocation_logging_config(
    loggingConfig={
        'cloudWatchConfig': {
            'logGroupName': '/aws/bedrock/model-invocations',
            'roleArn': 'arn:aws:iam::ACCOUNT_ID:role/BedrockLoggingRole'
        }
    }
)
```

---

## Google Vertex AI

### Overview

Claude models are available on Google Cloud's Vertex AI platform for generative AI workloads.

### Setup

#### 1. Install Google Cloud SDK

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version
```

#### 2. Authenticate with GCP

```bash
# Interactive authentication (sets up default credentials)
gcloud auth application-default login

# Or use service account
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Verify authentication
gcloud auth list
```

#### 3. Install SDK

**Option A: Using Anthropic's SDK**
```bash
pip install -U google-cloud-aiplatform "anthropic[vertex]"
```

**Option B: Using TypeScript**
```bash
npm install @anthropic-ai/vertex-sdk
```

#### 4. Enable Vertex AI API

```bash
# Enable required APIs
gcloud services enable aiplatform.googleapis.com

# Set your project
gcloud config set project MY_PROJECT_ID
```

### Available Models

| Model | Vertex AI Model ID | Availability |
|-------|-------------------|--------------|
| Claude Sonnet 4.5 | `claude-sonnet-4-5@20250929` | Most regions |
| Claude Sonnet 4 | `claude-sonnet-4@20250514` | Most regions |
| Claude Haiku 4.5 | `claude-haiku-4-5@20251001` | Limited regions |
| Claude Opus 4.1 | `claude-opus-4-1@20250805` | Select regions |

Check [Vertex AI Model Garden](https://cloud.google.com/model-garden) for latest availability.

### Example: Python with Anthropic SDK

```python
from anthropic import AnthropicVertex

# Initialize client
project_id = "my-project-id"
region = "global"  # or specific region like "us-east1"

client = AnthropicVertex(project_id=project_id, region=region)

# Make a request
message = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=100,
    messages=[
        {"role": "user", "content": "Hey Claude!"}
    ]
)

print(message.content[0].text)
```

### Example: TypeScript with Vertex SDK

```typescript
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

const projectId = 'my-project-id';
const region = 'global';  // or specific region like 'us-east1'

const client = new AnthropicVertex({
  projectId,
  region
});

async function main() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5@20250929',
    max_tokens: 100,
    messages: [
      {"role": "user", "content": "Hey Claude!"}
    ]
  });

  console.log(message.content[0].type === 'text' ? message.content[0].text : '');
}

main().catch(console.error);
```

### Example: Direct REST API

```bash
MODEL_ID="claude-sonnet-4-5@20250929"
LOCATION="global"
PROJECT_ID="my-project-id"

curl \
  -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/anthropic/models/${MODEL_ID}:streamRawPredict \
  -d '{
    "anthropic_version": "vertex-2023-10-16",
    "messages": [{"role": "user", "content": "Hey Claude!"}],
    "max_tokens": 100
  }'
```

### Activity Logging

Enable request-response logging:

```python
from google.cloud import aiplatform

aiplatform.init(project="my-project-id", location="global")

# Enable logging through Cloud Logging
# Configuration done in GCP Console:
# AI Platform > Settings > Request-response logging
```

---

## Quick Comparison

| Feature | Bedrock | Vertex AI |
|---------|---------|-----------|
| **Auth** | AWS credentials | GCP credentials |
| **Global Endpoints** | ✅ Yes (no premium) | ✅ Yes (pay-as-you-go only) |
| **Regional Endpoints** | ✅ Yes (+10% cost) | ✅ Yes (+10% cost) |
| **Provisional Throughput** | Bedrock On-Demand | Vertex Provisioned Throughput |
| **Setup Complexity** | Low | Low |
| **Pricing** | Pay-as-you-go | Pay-as-you-go + provisioned |
| **Support** | AWS Support | Google Cloud Support |

---

## Model Availability

### Regional Coverage

**Claude Sonnet 4.5 (Latest - Recommended)**
- Global: ✅ Available
- US: ✅ Available
- EU: ✅ Available (Bedrock, Vertex)
- Japan: ✅ Available (Bedrock)
- APAC: ❌ Not available (except Japan)

**Claude Opus 4.1**
- Bedrock: US only
- Vertex: Select regions

**Claude Haiku 4.5**
- Global: ✅ Available
- US: ✅ Available
- EU: ✅ Available
- Japan: ❌ Not available

Check latest availability:
- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html)
- [Vertex AI Model Garden](https://cloud.google.com/model-garden)

---

## Best Practices

### 1. Authentication & Credentials

**Never hardcode credentials:**
```python
# ❌ Bad
client = AnthropicBedrock(
    aws_access_key="AKIAIOSFODNN7EXAMPLE",
    aws_secret_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
)

# ✅ Good
client = AnthropicBedrock()  # Uses environment variables or IAM roles
```

**Use environment variables:**
```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-west-2"
```

**Use IAM roles in production:**
```python
# Applications running on EC2, Lambda, ECS automatically use instance IAM role
client = AnthropicBedrock(aws_region="us-west-2")
```

### 2. Endpoint Selection

**Global (recommended for most use cases):**
- No pricing premium
- Maximum availability
- Dynamic routing
- Use when data residency not critical

**Regional (for compliance/residency):**
- 10% pricing premium
- Guaranteed data routing
- Required for certain regulations
- Use with HIPAA, GDPR, etc.

### 3. Error Handling

```python
from anthropic import APIError, RateLimitError

try:
    message = client.messages.create(
        model="claude-sonnet-4-5@20250929",
        max_tokens=100,
        messages=[{"role": "user", "content": "Hello"}]
    )
except RateLimitError:
    print("Rate limited. Implement exponential backoff.")
except APIError as e:
    print(f"API error: {e}")
```

### 4. Logging & Monitoring

**Bedrock:**
```python
import logging
import boto3

# Enable debug logging
boto3.set_stream_logger('', logging.DEBUG)

# Or enable CloudWatch logging (see Activity Logging section)
```

**Vertex AI:**
```python
# Enable Cloud Logging
# Configuration in GCP Console under AI Platform settings
```

### 5. Cost Optimization

**Use appropriate model:**
- `claude-haiku-4-5`: Fast, low-cost (small tasks)
- `claude-sonnet-4-5`: Balanced (most use cases)
- `claude-opus-4.1`: Advanced reasoning (complex tasks)

**Optimize token usage:**
```python
# Shorter system prompts
# Avoid redundant messages
# Use max_tokens strategically
# Cache common context (where available)

message = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,  # Be specific, not overly generous
    messages=[...]
)
```

### 6. Rate Limiting & Retries

```python
import time
from anthropic import RateLimitError

def call_with_backoff(client, **kwargs):
    """Call API with exponential backoff."""
    for attempt in range(3):
        try:
            return client.messages.create(**kwargs)
        except RateLimitError:
            wait_time = 2 ** attempt  # 1s, 2s, 4s
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)
    raise Exception("Failed after retries")
```

### 7. Activity Logging

**Always enable logging for:**
- Compliance requirements
- Security auditing
- Cost tracking
- Debugging issues

Recommended: 30-day rolling retention minimum

---

## Additional Resources

### AWS Bedrock
- [Official Documentation](https://docs.aws.amazon.com/bedrock/)
- [Pricing](https://aws.amazon.com/bedrock/pricing/)
- [Model Availability](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html)

### Google Vertex AI
- [Official Documentation](https://cloud.google.com/vertex-ai/docs)
- [Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [Model Garden](https://cloud.google.com/model-garden)

### Anthropic
- [Official Documentation](https://docs.anthropic.com)
- [Pricing](https://www.anthropic.com/pricing)
- [Models Overview](https://docs.anthropic.com/about-claude/models-overview)

---

**Last Updated:** November 2025

**Status:** ✅ Production Ready
