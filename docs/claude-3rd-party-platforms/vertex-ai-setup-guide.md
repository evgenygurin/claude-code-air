# Google Vertex AI Setup Guide

Complete step-by-step setup guide for using Claude models on Google Cloud's Vertex AI.

## Prerequisites

- Google Cloud Account with billing enabled
- Google Cloud SDK (gcloud CLI)
- Python 3.8+ or Node.js 14+

## Step 1: Install Google Cloud SDK

### macOS
```bash
# Using Homebrew
brew install --cask google-cloud-sdk

# Or download from Google
# https://cloud.google.com/sdk/docs/install-sdk

# Initialize
gcloud init

# Verify
gcloud --version
```

### Linux
```bash
# Add Cloud SDK repo
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
  sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
  sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Install
sudo apt-get update && sudo apt-get install google-cloud-sdk

# Verify
gcloud --version
```

### Windows
Download from: https://cloud.google.com/sdk/docs/install-sdk

## Step 2: Authenticate with Google Cloud

### Option A: Interactive Authentication (Recommended)

```bash
# Opens browser for authentication
gcloud auth application-default login

# Creates credentials in default location:
# macOS/Linux: ~/.config/gcloud/application_default_credentials.json
# Windows: %APPDATA%\gcloud\application_default_credentials.json
```

### Option B: Service Account

```bash
# 1. Create service account in GCP Console
# or use:
gcloud iam service-accounts create vertex-ai-user \
  --display-name="Vertex AI User"

# 2. Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=vertex-ai-user@PROJECT_ID.iam.gserviceaccount.com

# 3. Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# 4. Verify
gcloud auth list
```

### Verify Authentication

```bash
# Test authentication
gcloud auth list

# Should show your account is authenticated
# Output:
#                    ACTIVE  ACCOUNT
#                 *  your-email@gmail.com
```

## Step 3: Set Up GCP Project

### Create Project

```bash
# List existing projects
gcloud projects list

# Create new project
gcloud projects create my-claude-project \
  --name="My Claude Project"

# Set as default
gcloud config set project my-claude-project
```

### Enable Required APIs

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Enable other useful APIs
gcloud services enable cloudlogging.googleapis.com
gcloud services enable cloudtrace.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled
```

## Step 4: Grant IAM Permissions

### Add Vertex AI Permissions

```bash
# Get your email
USER_EMAIL=$(gcloud config get-value account)

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=user:${USER_EMAIL} \
  --role=roles/aiplatform.user

# Grant Service Account User role (if using service account)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:vertex-ai-user@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/aiplatform.user
```

### Minimal Permissions

```json
{
  "version": "3",
  "etag": "BwXvF",
  "bindings": [
    {
      "role": "roles/aiplatform.user",
      "members": [
        "user:your-email@example.com"
      ]
    }
  ]
}
```

## Step 5: Install SDK

### Python with Anthropic SDK (Recommended)

```bash
# Install dependencies
pip install -U google-cloud-aiplatform "anthropic[vertex]"

# Verify
python -c "from anthropic import AnthropicVertex; print('✓ Installed')"
```

### TypeScript/JavaScript

```bash
npm install @anthropic-ai/vertex-sdk

# Verify
npm list @anthropic-ai/vertex-sdk
```

## Step 6: Test Connection

### Python Test

```python
from anthropic import AnthropicVertex

# Initialize client
project_id = "my-claude-project"
region = "global"  # or "us-east1", "europe-west1", etc.

client = AnthropicVertex(project_id=project_id, region=region)

# Make test request
message = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Say 'Hello from Vertex AI!' in 5 words or less."}
    ]
)

print("✓ Connection successful!")
print(message.content[0].text)
```

### TypeScript Test

```typescript
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

const projectId = 'my-claude-project';
const region = 'global';  // or 'us-east1', 'europe-west1', etc.

const client = new AnthropicVertex({
  projectId,
  region
});

async function test() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5@20250929',
    max_tokens: 256,
    messages: [
      {"role": "user", "content": "Say 'Hello from Vertex AI!' in 5 words or less."}
    ]
  });

  console.log('✓ Connection successful!');
  console.log(message.content[0].type === 'text' ? message.content[0].text : '');
}

test().catch(console.error);
```

## Troubleshooting

### Issue: "Permission denied: User does not have permission"

```text
❌ PermissionError: 403 User does not have permission
```

**Solution:**
```bash
# Check current project
gcloud config get-value project

# Verify IAM permissions
gcloud projects get-iam-policy PROJECT_ID

# Grant required role if missing
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=user:YOUR_EMAIL \
  --role=roles/aiplatform.user
```

### Issue: "Model not found or not available"

```bash
❌ InvalidArgument: Model not available in region
```

**Solution:**
1. Check model availability in region
2. Try global endpoint: `region="global"`
3. Check [Model Garden](https://cloud.google.com/model-garden) for availability

**List available models:**
```bash
gcloud ai models list \
  --project=PROJECT_ID \
  --region=us-east1
```

### Issue: "Application default credentials not found"

```text
❌ google.auth.exceptions.DefaultCredentialsError
```

**Solution:**
```bash
# Re-authenticate
gcloud auth application-default login

# Or set service account credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### Issue: "Vertex AI API not enabled"

```bash
❌ PermissionError: 403 Vertex AI API has not been used in project
```

**Solution:**
```bash
# Enable the API
gcloud services enable aiplatform.googleapis.com

# Wait a moment, then try again
```

## Security Best Practices

### 1. Use Application Default Credentials

```python
# ✅ Recommended - uses environment automatically
from anthropic import AnthropicVertex

client = AnthropicVertex(project_id="my-project", region="global")
```

### 2. Never Hardcode Credentials

```python
# ❌ Bad
import json
with open("service-account-key.json") as f:
    creds = json.load(f)
```

```python
# ✅ Good
# Credentials handled automatically by gcloud/google-auth
```

### 3. Use Least Privilege IAM Role

Instead of broad roles, use specific permissions:

```bash
# Better than editor/owner role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:SA_EMAIL \
  --role=roles/aiplatform.user
```

### 4. Rotate Service Account Keys

```bash
# List keys
gcloud iam service-accounts keys list \
  --iam-account=SERVICE_ACCOUNT_EMAIL

# Create new key
gcloud iam service-accounts keys create new-key.json \
  --iam-account=SERVICE_ACCOUNT_EMAIL

# Delete old key
gcloud iam service-accounts keys delete OLD_KEY_ID \
  --iam-account=SERVICE_ACCOUNT_EMAIL
```

### 5. Enable Audit Logging

```bash
# Enable Cloud Audit Logs (done in GCP Console)
# IAM & Admin > Audit Logs > Vertex AI

# View logs
gcloud logging read "resource.type=api" \
  --limit 50 \
  --format json
```

## Advanced Configuration

### Using Specific Region

```python
from anthropic import AnthropicVertex

# Regional endpoints with data residency
regions = {
    "us-east1": "US East (South Carolina)",
    "us-west1": "US West (Oregon)",
    "europe-west1": "EU (Belgium)",
    "europe-west4": "EU (Netherlands)",
    "asia-northeast1": "Asia (Tokyo)",
}

for region, name in regions.items():
    client = AnthropicVertex(
        project_id="my-project",
        region=region  # Specific region
    )
    print(f"✓ Client configured for {name}")
```

### Using Multiple Projects

```bash
# Switch projects
gcloud config set project PROJECT_1
gcloud config set project PROJECT_2

# Or use --project flag
gcloud ... --project=PROJECT_ID
```

```python
# Create client for specific project
client = AnthropicVertex(
    project_id="specific-project-id",
    region="global"
)
```

### Provisioned Throughput (Advanced)

For high-volume applications, use provisioned throughput:

```bash
# Create provisioned capacity
gcloud ai endpoints create-with-provisioned-capacity \
  --project=PROJECT_ID \
  --region=us-east1 \
  --location=us-east1 \
  --display-name="Claude Provisioned" \
  --machine-type=n1-standard-2 \
  --gpu-count=1 \
  --gpu-type=nvidia-tesla-t4
```

## Monitoring & Costs

### Enable Cloud Logging

```bash
# Configure request-response logging in GCP Console
# Vertex AI > Settings > Request-response logging

# View logs
gcloud logging read "resource.type=global" \
  --project=PROJECT_ID \
  --format=json \
  --limit=10
```

### Monitor Costs

```bash
# View Vertex AI costs
gcloud billing accounts list

# Check costs in Console
# Billing > Reports > Filter by "Vertex AI"
```

### Set Budget Alerts

```bash
# Create budget alert
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Vertex AI Budget" \
  --budget-amount=100 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

## Regional Availability

### Available Regions

```bash
# Check regional availability in Console
# Vertex AI > Model Garden > Search "Claude"

# Or check documentation:
# https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude
```

### Global vs Regional Endpoints

**Global Endpoint:**
- No data residency guarantee
- Maximum availability
- Use: `region="global"`

**Regional Endpoints:**
- Data stays in region
- Supports provisioned throughput
- Use: `region="us-east1"`, etc.

## Next Steps

1. ✅ Complete [Step 6 test](#step-6-test-connection)
2. 📚 Read [Vertex AI docs](https://cloud.google.com/vertex-ai/docs)
3. 💰 Check [Vertex AI pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
4. 🚀 Start building your application

## Support

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Google Cloud Support](https://cloud.google.com/support)
- [Anthropic Documentation](https://docs.anthropic.com)
- [Model Garden](https://cloud.google.com/model-garden)
