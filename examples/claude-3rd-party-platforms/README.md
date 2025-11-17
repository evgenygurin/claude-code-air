# Claude on 3rd-Party Platforms - Working Examples

Production-ready code examples for using Claude on AWS Bedrock and Google Vertex AI.

## 📁 Files Overview

### AWS Bedrock Examples (Python)

| File | Purpose | Complexity |
|------|---------|-----------|
| `bedrock_basic.py` | Simple message request | ⭐ Beginner |
| `bedrock_streaming.py` | Real-time streaming responses | ⭐⭐ Beginner |
| `bedrock_error_handling.py` | Retry logic with exponential backoff | ⭐⭐⭐ Intermediate |
| `bedrock_conversation.py` | Multi-turn conversations | ⭐⭐⭐ Intermediate |
| `bedrock_vision.py` | Image analysis with Claude | ⭐⭐⭐ Intermediate |

### Google Vertex AI Examples (Python)

| File | Purpose | Complexity |
|------|---------|-----------|
| `vertex_ai_basic.py` | Simple message request | ⭐ Beginner |
| `vertex_ai_streaming.py` | Real-time streaming responses | ⭐⭐ Beginner |

### TypeScript Examples

| File | Purpose | Platform |
|------|---------|----------|
| `bedrock_basic.ts` | Simple message request | AWS Bedrock |
| `vertex_ai_basic.ts` | Simple message request | Vertex AI |

## 🚀 Quick Start

### 1. AWS Bedrock - Python

**Setup:**
```bash
pip install -U "anthropic[bedrock]"
aws configure
```

**Run basic example:**
```bash
python bedrock_basic.py
```

**Expected output:**
```text
🔷 AWS Bedrock - Basic Claude Usage

Sending message to Claude...

✅ Response:
The capital of France is Paris.

📊 Token Usage:
  Input tokens: 18
  Output tokens: 8
  Stop reason: end_turn
```

### 2. AWS Bedrock - Streaming

**Run streaming example:**
```bash
python bedrock_streaming.py
```

**Features:**
- Real-time response as it's generated
- Better UX with immediate feedback
- Token counting with streaming

### 3. AWS Bedrock - Error Handling

**Run error handling example:**
```bash
python bedrock_error_handling.py
```

**Features:**
- Exponential backoff retry strategy
- Rate limit handling
- Proper error classification

### 4. AWS Bedrock - Conversation

**Run conversation example:**
```bash
python bedrock_conversation.py
```

**Interactive example with:**
- Multi-turn conversation history
- Context persistence
- Commands: `history`, `quit`

### 5. AWS Bedrock - Vision

**Run vision example:**
```bash
python bedrock_vision.py /path/to/image.png
```

**Supported formats:** PNG, JPG, GIF, WebP

### 6. Google Vertex AI - Python

**Setup:**
```bash
pip install -U google-cloud-aiplatform "anthropic[vertex]"
gcloud auth application-default login
```

**Edit file** - Replace `YOUR_PROJECT_ID`:
```bash
sed -i 's/YOUR_PROJECT_ID/my-actual-project-id/' vertex_ai_basic.py
```

**Run basic example:**
```bash
python vertex_ai_basic.py
```

### 7. TypeScript Examples

**Setup:**
```bash
npm install @anthropic-ai/bedrock-sdk @anthropic-ai/vertex-sdk
npm install -D typescript ts-node
```

**Run Bedrock example:**
```bash
npx ts-node bedrock_basic.ts
```

**Run Vertex AI example:**
```bash
npx ts-node vertex_ai_basic.ts
```

## 📚 Example Descriptions

### bedrock_basic.py

Simplest example - sends one message and gets response.

```python
client = AnthropicBedrock(aws_region="us-west-2")
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

**When to use:** Learning the basics, quick tests

---

### bedrock_streaming.py

Streams response tokens for better UX.

```python
with client.messages.stream(...) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

**When to use:** Long responses, user-facing applications, real-time UI updates

---

### bedrock_error_handling.py

Implements retry logic with exponential backoff.

```python
for attempt in range(max_retries):
    try:
        return client.messages.create(...)
    except RateLimitError:
        wait_time = 2 ** attempt
        time.sleep(wait_time)
```

**When to use:** Production applications, handling rate limits, reliability

---

### bedrock_conversation.py

Maintains conversation history for multi-turn interactions.

```python
class ChatSession:
    def __init__(self):
        self.conversation_history = []

    def chat(self, user_message):
        self.conversation_history.append({"role": "user", "content": user_message})
        response = client.messages.create(..., messages=self.conversation_history)
```

**When to use:** Chatbots, multi-turn Q&A, interactive assistants

---

### bedrock_vision.py

Sends images to Claude for analysis.

```python
message = client.messages.create(
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
            {"type": "text", "text": "Describe this image"}
        ]
    }]
)
```

**When to use:** Image analysis, visual understanding, document processing

---

## 🔧 Configuration

### AWS Bedrock

**Regions:**
```python
client = AnthropicBedrock(aws_region="us-west-2")  # or us-east-1, eu-west-1, etc.
```

**Model IDs:**
```python
# Global endpoint (no data residency guarantee)
"global.anthropic.claude-sonnet-4-5-20250929-v1:0"

# Regional endpoint (10% premium, data residency guaranteed)
"anthropic.claude-sonnet-4-5-20250929-v1:0"
```

### Google Vertex AI

**Regions:**
```python
client = AnthropicVertex(project_id="my-project", region="global")
# or: region="us-east1", "europe-west1", "asia-northeast1", etc.
```

**Model IDs:**
```python
"claude-sonnet-4-5@20250929"
"claude-haiku-4-5@20251001"
"claude-opus-4-1@20250805"
```

## 🔑 Authentication

### AWS Bedrock

**Option 1: Environment variables**
```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_DEFAULT_REGION="us-west-2"
```

**Option 2: AWS CLI**
```bash
aws configure
```

**Option 3: IAM role (EC2, Lambda, ECS)**
```python
# Credentials automatic from instance role
client = AnthropicBedrock(aws_region="us-west-2")
```

### Google Vertex AI

**Option 1: Application default credentials**
```bash
gcloud auth application-default login
```

**Option 2: Service account**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

**Option 3: Cloud Run/App Engine**
```python
# Credentials automatic from service
client = AnthropicVertex(project_id="my-project", region="global")
```

## 📊 Cost Examples

**Monthly costs** (1M tokens/day):

| Model | Input Cost | Output Cost | Monthly |
|-------|-----------|------------|---------|
| Haiku | $0.80/1M | $4.00/1M | ~$38 |
| Sonnet | $3.00/1M | $15.00/1M | ~$150 |
| Opus | $15.00/1M | $75.00/1M | ~$750 |

**Tips to optimize:**
1. Use Haiku for simple tasks
2. Use Sonnet for most work (best balance)
3. Use Opus only for complex reasoning
4. Monitor token usage with `message.usage`
5. Set appropriate `max_tokens` (not too high)

## 🐛 Troubleshooting

### "No credentials found" (Bedrock)

```bash
# Check if configured
aws sts get-caller-identity

# If not, configure
aws configure
```

### "Project ID required" (Vertex AI)

Edit the file and replace `YOUR_PROJECT_ID`:
```bash
sed -i 's/YOUR_PROJECT_ID/your-actual-project/' vertex_ai_*.py
```

### "Model not found"

**Bedrock:**
- Check model ID includes `global.` prefix for global endpoints
- Verify model access is enabled in Bedrock console

**Vertex AI:**
- Check model is available in your region
- Verify with: `gcloud ai models list --project=PROJECT_ID`

### "Rate limited"

Run `bedrock_error_handling.py` to see retry strategy in action.

## 📖 Documentation

For detailed documentation, see:
- `../docs/claude-3rd-party-platforms/README.md` - Complete overview
- `../docs/claude-3rd-party-platforms/bedrock-setup-guide.md` - AWS setup
- `../docs/claude-3rd-party-platforms/vertex-ai-setup-guide.md` - Vertex setup
- `../docs/claude-3rd-party-platforms/code-examples.md` - More examples

## 🚀 Production Checklist

Before deploying to production:

- [ ] Error handling implemented (see `bedrock_error_handling.py`)
- [ ] Secrets in environment variables, not hardcoded
- [ ] Logging enabled (CloudWatch for Bedrock, Cloud Logging for Vertex)
- [ ] Rate limiting strategy implemented
- [ ] Cost monitoring set up
- [ ] Authentication via IAM roles, not access keys
- [ ] Tested with expected token volumes
- [ ] Streaming used for long responses
- [ ] Conversation history limited (no unbounded memory)
- [ ] Activity audit logging enabled

## 📝 Example Modifications

### Change model version

**Bedrock:**
```python
model="global.anthropic.claude-haiku-4-5-20251001-v1:0"  # Use Haiku instead
```

**Vertex AI:**
```python
model="claude-haiku-4-5@20251001"  # Use Haiku instead
```

### Add system prompt

```python
response = client.messages.create(
    model="...",
    max_tokens=256,
    system="You are a helpful Python expert.",  # Add this
    messages=[...]
)
```

### Change region

**Bedrock:**
```python
client = AnthropicBedrock(aws_region="eu-west-1")  # Change region
```

**Vertex AI:**
```python
client = AnthropicVertex(project_id="my-project", region="europe-west1")
```

## 📚 Learn More

- [Anthropic Documentation](https://docs.anthropic.com)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Google Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Claude API Reference](https://docs.anthropic.com/reference)

## 📄 License

These examples are provided as-is for educational and production use.

---

**Happy coding! 🚀**
