# Claude on 3rd-Party Platforms - Working Examples

Production-ready code examples for AWS Bedrock and Google Vertex AI.

## 📁 Quick File Reference

```
claude-3rd-party-platforms/
├── README.md                    ← Start here (setup & guide)
├── INDEX.md                     ← This file
├── requirements.txt             ← Python dependencies
├── package.json                 ← TypeScript dependencies
│
├── AWS Bedrock Examples (Python):
├── bedrock_basic.py            ⭐ Simple message
├── bedrock_streaming.py        ⭐⭐ Real-time responses
├── bedrock_error_handling.py   ⭐⭐⭐ Retry logic
├── bedrock_conversation.py     ⭐⭐⭐ Multi-turn chat
├── bedrock_vision.py           ⭐⭐⭐ Image analysis
│
├── Google Vertex AI Examples (Python):
├── vertex_ai_basic.py          ⭐ Simple message
├── vertex_ai_streaming.py      ⭐⭐ Real-time responses
│
└── TypeScript Examples:
    ├── bedrock_basic.ts        ⭐ Bedrock simple
    └── vertex_ai_basic.ts      ⭐ Vertex simple
```

## 🚀 Quick Start (5 minutes)

### Option 1: AWS Bedrock (Python)

```bash
# 1. Install dependencies
pip install -U "anthropic[bedrock]"

# 2. Configure AWS
aws configure

# 3. Run example
python bedrock_basic.py
```

### Option 2: Google Vertex AI (Python)

```bash
# 1. Install dependencies
pip install -U google-cloud-aiplatform "anthropic[vertex]"

# 2. Authenticate
gcloud auth application-default login

# 3. Edit file (replace YOUR_PROJECT_ID)
nano vertex_ai_basic.py

# 4. Run example
python vertex_ai_basic.py
```

### Option 3: TypeScript

```bash
# 1. Install dependencies
npm install

# 2. Run Bedrock example
npm run bedrock:basic

# 3. Or run Vertex example
npm run vertex:basic
```

## 📊 Example Comparison

| Name | Type | Complexity | Use Case |
|------|------|-----------|----------|
| `bedrock_basic.py` | Python | ⭐ | Learn the basics |
| `bedrock_streaming.py` | Python | ⭐⭐ | Long responses |
| `bedrock_error_handling.py` | Python | ⭐⭐⭐ | Production code |
| `bedrock_conversation.py` | Python | ⭐⭐⭐ | Chatbots |
| `bedrock_vision.py` | Python | ⭐⭐⭐ | Image analysis |
| `vertex_ai_basic.py` | Python | ⭐ | Learn Vertex |
| `vertex_ai_streaming.py` | Python | ⭐⭐ | Streaming on Vertex |
| `bedrock_basic.ts` | TypeScript | ⭐ | TypeScript/JS users |
| `vertex_ai_basic.ts` | TypeScript | ⭐ | TypeScript/JS users |

## 🎯 Learning Path

### Beginner (⭐)
1. Read: README.md
2. Run: `bedrock_basic.py`
3. Modify: Change the prompt, try different models

### Intermediate (⭐⭐)
1. Run: `bedrock_streaming.py`
2. Run: `vertex_ai_basic.py`
3. Modify: Add a system prompt to any example

### Advanced (⭐⭐⭐)
1. Study: `bedrock_error_handling.py`
2. Study: `bedrock_conversation.py`
3. Study: `bedrock_vision.py`
4. Combine patterns for your use case

## 📝 Running Each Example

### bedrock_basic.py
```bash
python bedrock_basic.py
# Output: Simple response with token count
```

### bedrock_streaming.py
```bash
python bedrock_streaming.py
# Output: Real-time streaming response
```

### bedrock_error_handling.py
```bash
python bedrock_error_handling.py
# Output: Response with retry logic demo
```

### bedrock_conversation.py
```bash
python bedrock_conversation.py
# Interactive chat session
# Commands: quit, history
```

### bedrock_vision.py
```bash
python bedrock_vision.py /path/to/image.png
# Output: Image analysis
```

### vertex_ai_basic.py
```bash
# Edit file first: replace YOUR_PROJECT_ID
python vertex_ai_basic.py
# Output: Simple response from Vertex AI
```

### vertex_ai_streaming.py
```bash
# Edit file first: replace YOUR_PROJECT_ID
python vertex_ai_streaming.py
# Output: Streaming response from Vertex AI
```

### TypeScript Examples
```bash
npm run bedrock:basic
npm run vertex:basic
```

## 🔧 Common Modifications

### Change Model
**Python:**
```python
model="global.anthropic.claude-haiku-4-5-20251001-v1:0"  # Haiku instead
```

**TypeScript:**
```typescript
model: 'claude-haiku-4-5@20251001'  // Haiku instead
```

### Change Region
**Bedrock:**
```python
client = AnthropicBedrock(aws_region="eu-west-1")
```

**Vertex:**
```python
client = AnthropicVertex(project_id="my-project", region="europe-west1")
```

### Add System Prompt
```python
response = client.messages.create(
    model="...",
    max_tokens=256,
    system="You are a helpful Python expert.",
    messages=[...]
)
```

### Increase Max Tokens
```python
response = client.messages.create(
    model="...",
    max_tokens=1024,  # Changed from 256
    messages=[...]
)
```

## 📚 Understanding the Code

### Basic Pattern
```python
from anthropic import AnthropicBedrock

# 1. Initialize
client = AnthropicBedrock(aws_region="us-west-2")

# 2. Send message
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[{"role": "user", "content": "Hello!"}]
)

# 3. Get response
text = message.content[0].text
print(text)
```

### Streaming Pattern
```python
with client.messages.stream(...) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Error Handling Pattern
```python
try:
    response = client.messages.create(...)
except RateLimitError:
    # Handle rate limit
    time.sleep(2)
except APIError as e:
    # Handle other API errors
    print(f"Error: {e}")
```

### Conversation Pattern
```python
conversation = []
# Add user message
conversation.append({"role": "user", "content": "Hello"})
# Get response (context-aware)
response = client.messages.create(..., messages=conversation)
# Add assistant response for next turn
conversation.append({"role": "assistant", "content": response_text})
```

## 🔑 Key Concepts

**Model IDs:**
- Bedrock: `global.anthropic.claude-*-20250929-v1:0` (global endpoints)
- Vertex: `claude-*@20250929` (regional routing via `region` parameter)

**Token Usage:**
```python
print(message.usage.input_tokens)   # Tokens in your input
print(message.usage.output_tokens)  # Tokens in response
```

**Streaming vs Non-Streaming:**
- Use streaming for long responses (better UX)
- Use non-streaming for short responses (simpler code)

**Max Tokens:**
- Set based on expected response length
- Smaller values = faster/cheaper
- Larger values = more flexibility

## 🐛 Debugging Tips

**Check credentials:**
```bash
# Bedrock
aws sts get-caller-identity

# Vertex
gcloud auth application-default login
```

**Check region/project:**
```bash
# Bedrock
aws configure get region

# Vertex
gcloud config get-value project
```

**Enable debug logging:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Test with Haiku (fast/cheap):**
```python
model="global.anthropic.claude-haiku-4-5-20251001-v1:0"
```

## 📖 Full Documentation

For complete documentation, see:
- `../../docs/claude-3rd-party-platforms/README.md` - Platform overview
- `../../docs/claude-3rd-party-platforms/bedrock-setup-guide.md` - Bedrock setup
- `../../docs/claude-3rd-party-platforms/vertex-ai-setup-guide.md` - Vertex setup
- `../../docs/claude-3rd-party-platforms/code-examples.md` - More patterns

## 💡 Next Steps

1. ✅ Pick a platform (Bedrock or Vertex)
2. ✅ Run the basic example
3. ✅ Read the comprehensive documentation
4. ✅ Try streaming and conversation examples
5. ✅ Adapt code for your use case
6. 🚀 Deploy to production

## 📞 Getting Help

**Setup issues?**
→ Check platform-specific setup guides in `docs/`

**Code issues?**
→ Check README.md Troubleshooting section

**Want more examples?**
→ See `docs/claude-3rd-party-platforms/code-examples.md`

---

**Happy coding! 🚀**
