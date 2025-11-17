# AWS Bedrock Setup Guide

Complete step-by-step setup guide for using Claude models on Amazon Bedrock.

## Prerequisites

- AWS Account with billing enabled
- AWS CLI v2.13.23 or newer
- Python 3.8+ or Node.js 14+

## Step 1: Install AWS CLI

### macOS
```bash
# Using Homebrew
brew install awscli

# Or download from AWS
# https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify
aws --version  # Should show version 2.13.23+
```

### Linux
```bash
curl "https://awscli.amazonaws.com/awscliv2.tar.gz" -o "awscliv2.tar.gz"
tar xzf awscliv2.tar.gz
sudo ./aws/install

aws --version
```

### Windows
Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

## Step 2: Configure AWS Credentials

### Option A: Interactive Configuration (Recommended)

```bash
aws configure

# You'll be prompted for:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: [us-west-2]
# Default output format: [json]
```

### Option B: Environment Variables

```bash
# macOS/Linux
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_DEFAULT_REGION="us-west-2"

# Windows (PowerShell)
$env:AWS_ACCESS_KEY_ID="your-access-key-id"
$env:AWS_SECRET_ACCESS_KEY="your-secret-access-key"
$env:AWS_DEFAULT_REGION="us-west-2"
```

### Option C: AWS Credentials File

**Location:**
- macOS/Linux: `~/.aws/credentials`
- Windows: `%USERPROFILE%\.aws\credentials`

**Format:**
```ini
[default]
aws_access_key_id = your-access-key-id
aws_secret_access_key = your-secret-access-key

[bedrock-profile]
aws_access_key_id = another-access-key-id
aws_secret_access_key = another-secret-access-key
```

### Verify Configuration

```bash
# Test credentials
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDAJ...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/your-username"
# }
```

## Step 3: Enable Bedrock Access

### Via AWS Console (Easiest)

1. Navigate to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/home)
2. Click **Model Access** in left sidebar
3. Click **Manage Model Access**
4. Find "Anthropic Claude" models
5. Check boxes for desired models
6. Click **Save changes**

Access is usually granted instantly.

### Via AWS CLI

```bash
# List all Anthropic models
aws bedrock list-foundation-models \
  --region us-west-2 \
  --by-provider anthropic \
  --query "modelSummaries[*].modelId"

# Expected output shows available model IDs
```

## Step 4: Install SDK

### Python with Anthropic SDK (Recommended)

```bash
# Install latest version
pip install -U "anthropic[bedrock]"

# Verify installation
python -c "from anthropic import AnthropicBedrock; print('✓ Installed')"
```

### Python with Boto3

```bash
pip install boto3>=1.28.59

# Verify
python -c "import boto3; print(boto3.__version__)"
```

### TypeScript/JavaScript

```bash
npm install @anthropic-ai/bedrock-sdk

# Verify
npm list @anthropic-ai/bedrock-sdk
```

## Step 5: Test Connection

### Python Test

```python
from anthropic import AnthropicBedrock

# Initialize client (uses environment credentials)
client = AnthropicBedrock(aws_region="us-west-2")

# Make test request
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Say 'Hello from Bedrock!' in 5 words or less."}
    ]
)

print("✓ Connection successful!")
print(message.content[0].text)
```

### TypeScript Test

```typescript
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

const client = new AnthropicBedrock({
  awsRegion: 'us-west-2'
});

async function test() {
  const message = await client.messages.create({
    model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    max_tokens: 256,
    messages: [
      {"role": "user", "content": "Say 'Hello from Bedrock!' in 5 words or less."}
    ]
  });

  console.log('✓ Connection successful!');
  console.log(message.content[0].type === 'text' ? message.content[0].text : '');
}

test().catch(console.error);
```

## Troubleshooting

### Issue: "No credentials found"

```text
❌ botocore.exceptions.NoCredentialsError: Unable to locate credentials
```

**Solution:**
```bash
# Verify AWS credentials are configured
aws sts get-caller-identity

# If not, configure:
aws configure
```

### Issue: "User is not authorized to perform"

```text
❌ botocore.exceptions.UnauthorizedOperation: An error occurred (AccessDenied)
```

**Solution:**
1. Check IAM permissions include `bedrock:InvokeModel`
2. Verify model access is enabled in Bedrock console
3. Ensure using correct region

### Issue: "Model not found"

```text
❌ ValidationException: Could not find a model with modelId
```

**Solution:**
1. Verify model ID spelling (include `global.` prefix for global endpoints)
2. Check model is available in your region
3. Confirm model access is enabled

### Issue: "Rate limit exceeded"

```text
❌ ThrottlingException: Rate exceeded
```

**Solution:**
Implement exponential backoff:
```python
import time

def call_with_retry(client, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.messages.create(...)
        except Exception as e:
            if "ThrottlingException" in str(e):
                wait = 2 ** attempt
                print(f"Rate limited. Waiting {wait}s...")
                time.sleep(wait)
            else:
                raise
```

## Security Best Practices

### 1. Use IAM Roles (Production)

```bash
# Create IAM role for Bedrock access
# Attach policy: AmazonBedrockFullAccess (or specific policy)

# Use with EC2, Lambda, ECS - credentials automatic
client = AnthropicBedrock(aws_region="us-west-2")
```

### 2. Never Hardcode Credentials

```python
# ❌ Bad
client = AnthropicBedrock(
    aws_access_key="AKIAIOSFODNN7EXAMPLE",
    aws_secret_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
)

# ✅ Good
client = AnthropicBedrock()  # Uses environment or IAM role
```

### 3. Use Least Privilege IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-*"
      ]
    }
  ]
}
```

### 4. Rotate Credentials Regularly

- AWS recommends 90-day rotation
- Use AWS Secrets Manager for sensitive data
- Monitor access logs in CloudTrail

## Advanced Configuration

### Using Specific AWS Profile

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(
    aws_profile="bedrock-profile",  # From ~/.aws/credentials
    aws_region="us-west-2"
)
```

### Temporary Credentials

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(
    aws_access_key="ASIA...",
    aws_secret_key="...",
    aws_session_token="FwoGZXIvYXdzEBE...",
    aws_region="us-west-2"
)
```

### Using STS Assume Role

```bash
# Get temporary credentials
aws sts assume-role \
  --role-arn arn:aws:iam::ACCOUNT:role/BedrockRole \
  --role-session-name my-session

# Export credentials from output
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
```

## Monitoring & Costs

### Enable CloudWatch Logging

```python
import boto3

bedrock = boto3.client("bedrock")

response = bedrock.put_model_invocation_logging_config(
    loggingConfig={
        "cloudWatchConfig": {
            "logGroupName": "/aws/bedrock/invocations",
            "roleArn": "arn:aws:iam::ACCOUNT:role/CloudWatchLoggingRole"
        }
    }
)
```

### Monitor Costs

```bash
# View Bedrock costs in AWS Console
# Cost Explorer > Filter by service "Bedrock"

# Or use AWS CLI
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity DAILY \
  --metrics "BlendedCost" \
  --filter file://filter.json
```

## Regional Availability

### Available Regions

```bash
# List regions with Bedrock
aws ec2 describe-regions --query "Regions[*].RegionName" --all-regions

# Common regions:
# us-east-1, us-west-2, eu-west-1, ap-southeast-1, etc.
```

### Recommended Regions

- **US**: `us-west-2` (lowest latency for most)
- **EU**: `eu-west-1` (GDPR compliance)
- **APAC**: `ap-southeast-1` (Singapore)

## Next Steps

1. ✅ Complete [Step 5 test](#step-5-test-connection)
2. 📚 Read [Bedrock API docs](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
3. 💰 Check [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
4. 🚀 Start building your application

## Support

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Support](https://console.aws.amazon.com/support/)
- [Anthropic Documentation](https://docs.anthropic.com)
