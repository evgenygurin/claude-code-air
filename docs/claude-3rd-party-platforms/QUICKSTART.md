# Claude on 3rd-Party Platforms - Quick Start Guide

Get started using Claude on AWS Bedrock or Google Vertex AI in 5 minutes.

## Choose Your Platform

### 🔶 AWS Bedrock

**Best for:**
- AWS-native applications
- Existing AWS infrastructure
- Simple authentication with IAM roles

**Quick Start:**
```bash
# 1. Install
pip install -U "anthropic[bedrock]"

# 2. Configure AWS credentials
aws configure

# 3. Enable Bedrock access
# Go to: https://console.aws.amazon.com/bedrock/home#/modelaccess

# 4. Run
python -c "
from anthropic import AnthropicBedrock
client = AnthropicBedrock(aws_region='us-west-2')
msg = client.messages.create(
    model='global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    max_tokens=256,
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(msg.content[0].text)
"
```

**Learn More:** [bedrock-setup-guide.md](./bedrock-setup-guide.md)

---

### 🔵 Google Vertex AI

**Best for:**
- Google Cloud projects
- Needing regional data residency
- Multi-region applications

**Quick Start:**
```bash
# 1. Install
pip install -U google-cloud-aiplatform "anthropic[vertex]"

# 2. Authenticate
gcloud auth application-default login

# 3. Enable APIs
gcloud services enable aiplatform.googleapis.com

# 4. Run
python -c "
from anthropic import AnthropicVertex
client = AnthropicVertex(project_id='MY_PROJECT', region='global')
msg = client.messages.create(
    model='claude-sonnet-4-5@20250929',
    max_tokens=256,
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(msg.content[0].text)
"
```

**Learn More:** [vertex-ai-setup-guide.md](./vertex-ai-setup-guide.md)

---

## Side-by-Side Comparison

| Aspect | Bedrock | Vertex AI |
|--------|---------|-----------|
| **Setup Time** | ~5 minutes | ~5 minutes |
| **Authentication** | AWS credentials | GCP credentials |
| **Global Endpoints** | ✅ Yes (free) | ✅ Yes (pay-as-you-go) |
| **Regional Options** | ✅ Yes (+10%) | ✅ Yes (+10%) |
| **Import** | `anthropic[bedrock]` | `anthropic[vertex]` |
| **Default Region** | `us-west-2` | `global` |

---

## Common Tasks

### Initialize Client

**Bedrock:**
```python
from anthropic import AnthropicBedrock
client = AnthropicBedrock(aws_region="us-west-2")
```

**Vertex AI:**
```python
from anthropic import AnthropicVertex
client = AnthropicVertex(project_id="my-project", region="global")
```

### Send Message

**Both Platforms:**
```python
message = client.messages.create(
    model="MODEL_ID",  # See below for IDs
    max_tokens=256,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

### Available Models

| Model | Bedrock | Vertex |
|-------|---------|--------|
| **Sonnet 4.5** (Latest) | `global.anthropic.claude-sonnet-4-5-20250929-v1:0` | `claude-sonnet-4-5@20250929` |
| **Sonnet 4** | `global.anthropic.claude-sonnet-4-20250514-v1:0` | `claude-sonnet-4@20250514` |
| **Haiku 4.5** | `global.anthropic.claude-haiku-4-5-20251001-v1:0` | `claude-haiku-4-5@20251001` |
| **Opus 4.1** | `anthropic.claude-opus-4-1-20250805-v1:0` | `claude-opus-4-1@20250805` |

### Stream Response

**Bedrock:**
```python
with client.messages.stream(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[{"role": "user", "content": "Write a poem"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

**Vertex AI:**
```python
with client.messages.stream(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    messages=[{"role": "user", "content": "Write a poem"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Handle Errors

```python
from anthropic import RateLimitError
import time

try:
    message = client.messages.create(...)
except RateLimitError:
    print("Rate limited, retrying...")
    time.sleep(2)
    message = client.messages.create(...)
```

---

## Authentication Troubleshooting

### Bedrock: "No credentials found"

```bash
# Configure AWS credentials
aws configure

# Verify
aws sts get-caller-identity
```

### Vertex AI: "Permission denied"

```bash
# Authenticate
gcloud auth application-default login

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=user:YOUR_EMAIL \
  --role=roles/aiplatform.user
```

---

## Cost Optimization

1. **Use Haiku for simple tasks** - Fastest and cheapest model
2. **Use Sonnet for most work** - Best balance of speed and cost
3. **Use Opus for complex reasoning** - When you need advanced capabilities
4. **Monitor usage** - Check CloudWatch (Bedrock) or Cloud Logging (Vertex)

**Estimated Monthly Costs** (1M tokens/day):
- **Haiku**: ~$30
- **Sonnet**: ~$150
- **Opus**: ~$300

---

## Code Examples

For complete code examples, see: [code-examples.md](./code-examples.md)

**Included Examples:**
- ✅ Basic usage
- ✅ Error handling
- ✅ Streaming
- ✅ Vision/Images
- ✅ System prompts
- ✅ Multi-turn conversations
- ✅ Function calling
- ✅ Batch processing

---

## Full Setup Guides

Choose your platform for detailed setup:

- **AWS Bedrock**: [bedrock-setup-guide.md](./bedrock-setup-guide.md)
  - Detailed step-by-step instructions
  - Troubleshooting guide
  - Security best practices
  - Monitoring & costs

- **Google Vertex AI**: [vertex-ai-setup-guide.md](./vertex-ai-setup-guide.md)
  - Detailed step-by-step instructions
  - Regional configuration
  - Troubleshooting guide
  - Provisioned throughput setup

---

## Key Resources

### Official Documentation
- [Anthropic API Docs](https://docs.anthropic.com)
- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [Google Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)

### Pricing
- [AWS Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
- [Google Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)

### Model Information
- [Available Models](./README.md#model-availability)
- [Regional Availability](./README.md#regional-coverage)

---

## Next Steps

1. ✅ Choose your platform (Bedrock or Vertex AI)
2. ✅ Follow the quick start above
3. ✅ Run the test command to verify setup
4. ✅ Check [code-examples.md](./code-examples.md) for your use case
5. ✅ Read the full setup guide for your platform
6. 🚀 Start building!

---

## FAQ

**Q: Which platform should I choose?**
A: If you're already using AWS, choose Bedrock. If using GCP, choose Vertex AI. Both are equally capable and have similar APIs.

**Q: Can I use both platforms?**
A: Yes! The Anthropic SDK supports both. You can even use different platforms in different parts of your application.

**Q: What if I get a "model not found" error?**
A: Make sure the model is available in your region and you have access enabled. Check the setup guides for your platform.

**Q: How much does it cost?**
A: Pricing varies by model and platform. See the setup guides for detailed pricing information.

**Q: Can I cache prompts to reduce costs?**
A: Yes, prompt caching is available on Vertex AI. See [code-examples.md](./code-examples.md#prompt-caching-vertex-ai).

**Q: What about regional data residency?**
A: Both platforms offer regional endpoints with data residency guarantees. See the comparison in [README.md](./README.md#regional-availability).

---

**Happy coding! 🚀**

For more details, explore the documentation in this directory.
