# Claude on 3rd-Party Platforms - Complete Learning Guide

Comprehensive guide analyzing examples and best practices from the implementation.

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Patterns](#core-patterns)
3. [Best Practices](#best-practices)
4. [Common Pitfalls](#common-pitfalls)
5. [Advanced Techniques](#advanced-techniques)
6. [Production Deployment](#production-deployment)
7. [Case Studies](#case-studies)

---

## Architecture Overview

### Three-Layer Architecture

```text
┌─────────────────────────────────────┐
│      Application Layer              │
│  (Your Code / Business Logic)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      SDK Layer                      │
│  (Anthropic SDK / Bedrock SDK)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Platform Layer                 │
│  (AWS Bedrock / Google Vertex AI)   │
└─────────────────────────────────────┘
```

### Key Components

**Bedrock Stack:**
- Client: `AnthropicBedrock`
- Auth: AWS credentials (environment/IAM role)
- Models: `global.anthropic.claude-*-20250929-v1:0`
- Regions: Global, US, EU, JP

**Vertex AI Stack:**
- Client: `AnthropicVertex`
- Auth: GCP credentials (service account/default)
- Models: `claude-*@20250929`
- Regions: Global, regional (us-east1, europe-west1, etc.)

---

## Core Patterns

### Pattern 1: Basic Message Request

**File:** `bedrock_basic.py`

**Key Concepts:**

```python
# 1. Initialization (lazy-loaded, reusable)
client = AnthropicBedrock(aws_region="us-west-2")

# 2. Message structure (role-based)
messages=[
    {"role": "user", "content": "What is X?"}
]

# 3. Parameters
model="global.anthropic.claude-sonnet-4-5-20250929-v1:0"
max_tokens=256

# 4. Response extraction
text = message.content[0].text
tokens = message.usage.input_tokens
```

**Why This Pattern:**

- ✅ Minimal setup (3-4 lines)
- ✅ Easy to understand
- ✅ Production-ready
- ✅ Token tracking built-in

**When to Use:**

- Simple queries
- One-off requests
- Testing/prototyping
- Learning the API

**Common Mistakes:**

```python
# ❌ Wrong: Creating new client each time (wasteful)
for msg in messages:
    client = AnthropicBedrock()  # DON'T DO THIS
    response = client.messages.create(...)

# ✅ Right: Reuse client
client = AnthropicBedrock()
for msg in messages:
    response = client.messages.create(...)
```

---

### Pattern 2: Error Handling with Retries

**File:** `bedrock_error_handling.py`

**Key Concepts:**

```python
# Exponential backoff formula
wait_time = 2 ** attempt  # 1s, 2s, 4s, 8s...

# Error classification
- RateLimitError      → Retry (temporary)
- ThrottlingException → Retry (temporary)
- APIError            → Analyze (may retry)
- Other Exception     → Fail (permanent)

# Retry loop structure
for attempt in range(max_retries):
    try:
        return api_call()
    except RecoverableError:
        if can_retry(attempt):
            wait_and_retry()
    except FatalError:
        raise
```

**Why This Pattern:**

- ✅ Handles transient failures
- ✅ Prevents overwhelming API
- ✅ Preserves token budget (doesn't retry fatal errors)
- ✅ Production-essential

**When to Use:**

- Production applications
- Batch processing
- High-volume requests
- External API calls

**Real-World Example:**

```python
# Scenario: Rate-limited during peak usage
Attempt 1: Rate limit → wait 1 second
Attempt 2: Rate limit → wait 2 seconds
Attempt 3: Success → return response

Total delay: 3 seconds (acceptable)
```

**Cost Implications:**

- Each retry costs tokens (input)
- Exponential backoff = fewer retries = lower cost
- Alternative: Circuit breaker (skip requests if rate-limited)

---

### Pattern 3: Multi-Turn Conversations

**File:** `bedrock_conversation.py`

**Key Concepts:**

```python
class ChatSession:
    def __init__(self):
        self.conversation_history = []  # Stateful storage
        self.system_prompt = "Be helpful"

    def chat(self, user_message):
        # 1. Add to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # 2. Send entire history (Claude understands context)
        response = client.messages.create(
            system=self.system_prompt,
            messages=self.conversation_history  # ALL messages
        )

        # 3. Append response for next turn
        self.conversation_history.append({
            "role": "assistant",
            "content": response_text
        })
```

**Why This Pattern:**

- ✅ Context persistence across turns
- ✅ Claude maintains conversation state
- ✅ Stateful management separates concerns
- ✅ Supports interactive applications

**When to Use:**

- Chatbots
- Interactive assistants
- Multi-step problem solving
- Debugging/analysis sessions

**Memory Considerations:**

```python
# ⚠️  Token usage grows with conversation length
Turn 1: tokens = 50
Turn 2: tokens = 100  (50 + new input)
Turn 3: tokens = 150  (100 + new input)
Turn 4: tokens = 200  (150 + new input)

# 💡 Solution: Summarization for long conversations
if conversation_length > 50:
    # Summarize older messages to save tokens
    summary = summarize_messages(conversation_history[:25])
    conversation_history = [summary] + conversation_history[25:]
```

**Timeout Pattern:**

```python
# Limit conversation history to prevent timeouts
MAX_HISTORY = 50

if len(conversation_history) > MAX_HISTORY:
    # Keep system messages + recent history only
    conversation_history = (
        conversation_history[:5] +  # System context
        conversation_history[-45:]   # Recent messages
    )
```

---

### Pattern 4: Streaming for Real-Time Responses

**File:** `bedrock_streaming.py`

**Key Concepts:**

```python
# Non-streaming (blocks until complete)
message = client.messages.create(...)
print(message.content[0].text)  # Wait for full response

# Streaming (immediate feedback)
with client.messages.stream(...) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)  # Real-time output
```

**Why This Pattern:**

- ✅ Better UX (immediate feedback)
- ✅ Lower apparent latency
- ✅ Same token cost as non-streaming
- ✅ No buffering delays

**When to Use:**

- User-facing applications
- Long responses (>500 tokens)
- Real-time dashboards
- Chat interfaces

**Token Counting with Streaming:**

```python
with client.messages.stream(...) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

# Get token counts from final message
final_message = stream.get_final_message()
print(f"Tokens: {final_message.usage.output_tokens}")
```

**Performance Implications:**

- Streaming: Low initial latency, continuous updates
- Non-streaming: High initial latency, immediate completion
- Both have same total time (streaming feels faster)

---

### Pattern 5: Vision/Image Input

**File:** `bedrock_vision.py`

**Key Concepts:**

```python
# 1. Encode image to base64
with open("image.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

# 2. Send as multimodal message
message = client.messages.create(
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",  # or jpeg, gif, webp
                    "data": image_data
                }
            },
            {
                "type": "text",
                "text": "Describe this image"
            }
        ]
    }]
)
```

**Why This Pattern:**

- ✅ Supports all image formats
- ✅ Direct base64 encoding (no uploads)
- ✅ Works offline (local processing)
- ✅ Cost-effective

**Supported Formats:**

- PNG (recommended)
- JPEG
- GIF
- WebP

**Size Limits:**

- Max file size: Not explicitly limited
- Recommended: < 5MB
- Resolution: Supports high-resolution analysis

**Use Cases:**

- Document analysis
- Chart interpretation
- Screenshot analysis
- Image description
- Content moderation

---

## Best Practices

### 1. Authentication Security

**❌ Bad Practices:**

```python
# Never hardcode credentials
client = AnthropicBedrock(
    aws_access_key="AKIAIOSFODNN7EXAMPLE",
    aws_secret_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
)

# Don't commit .env files with secrets
# Don't log credentials
```

**✅ Best Practices:**

```python
# Use environment variables
client = AnthropicBedrock(aws_region="us-west-2")
# Reads from: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

# Use IAM roles (production)
# On EC2, Lambda, ECS: automatic credential discovery

# Use service accounts (Google)
# Set GOOGLE_APPLICATION_CREDENTIALS env var
```

### 2. Cost Optimization

**Token Usage Metrics:**

```python
# Track all requests
total_input = 0
total_output = 0

for request in requests:
    message = client.messages.create(...)
    total_input += message.usage.input_tokens
    total_output += message.usage.output_tokens

print(f"Input tokens: {total_input} (~${total_input * 0.003 / 1000:.2f})")
print(f"Output tokens: {total_output} (~${total_output * 0.015 / 1000:.2f})")
```

**Model Selection by Use Case:**

```python
# Haiku (fastest/cheapest) - 3x cheaper than Sonnet
# Use for: Simple tasks, high volume, cost-sensitive
model="global.anthropic.claude-haiku-4-5-20251001-v1:0"

# Sonnet (balanced) - 50x cheaper than Opus
# Use for: Most tasks, production workloads
model="global.anthropic.claude-sonnet-4-5-20250929-v1:0"

# Opus (most capable) - Complex reasoning only
# Use for: Research, complex problem-solving
model="anthropic.claude-opus-4-1-20250805-v1:0"
```

**Token Reduction Strategies:**

```python
# 1. Shorter prompts
# Instead of: "Please explain in detail..."
# Use: "Explain briefly"

# 2. Specific max_tokens
# Instead of: max_tokens=2000
# Use: max_tokens=256  # Set based on expected output

# 3. Conversation summarization
# Summarize old messages to save history tokens

# 4. Caching (Vertex AI feature)
# Reuse prompts that are frequently repeated
```

### 3. Error Handling Strategy

**Hierarchical Error Handling:**

```python
try:
    response = client.messages.create(...)

except RateLimitError:
    # Expected: Transient, safe to retry
    time.sleep(2 ** attempt)

except APIError as e:
    if "ThrottlingException" in str(e):
        # Expected: Transient, safe to retry
        time.sleep(2 ** attempt)
    else:
        # Unexpected: May require investigation
        log_error("Unexpected API error", e)
        raise

except Exception as e:
    # Unexpected: Unknown, fail fast
    log_error("Critical error", e)
    raise
```

### 4. Testing Strategies

**Unit Test Pattern:**

```python
import unittest
from unittest.mock import Mock, patch

class TestBedrock(unittest.TestCase):
    def setUp(self):
        self.client = AnthropicBedrock(aws_region="us-west-2")

    def test_basic_request(self):
        # Mock the API call
        with patch.object(self.client, 'messages') as mock_messages:
            mock_messages.create.return_value = Mock(
                content=[Mock(text="Expected response")],
                usage=Mock(input_tokens=10, output_tokens=5)
            )

            response = self.client.messages.create(...)
            assert response.content[0].text == "Expected response"
```

**Integration Test Pattern:**

```python
class TestBedrockIntegration(unittest.TestCase):
    def test_real_api_call(self):
        client = AnthropicBedrock(aws_region="us-west-2")

        message = client.messages.create(
            model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
            max_tokens=10,  # Minimal tokens to save cost
            messages=[{"role": "user", "content": "Hi"}]
        )

        assert message.content[0].text is not None
        assert message.usage.input_tokens > 0
```

### 5. Monitoring & Logging

**Comprehensive Logging Pattern:**

```python
import logging

logger = logging.getLogger(__name__)

def call_api(prompt, model="sonnet"):
    logger.info(f"API call: model={model}, input_tokens_estimated={len(prompt)//4}")

    try:
        response = client.messages.create(
            model=model,
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}]
        )

        logger.info(
            f"API success: input={response.usage.input_tokens}, "
            f"output={response.usage.output_tokens}"
        )

        return response

    except RateLimitError as e:
        logger.warning(f"Rate limited: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise
```

---

## Common Pitfalls

### Pitfall 1: Not Reusing Client

**Problem:** Creating new client for each request

```python
# ❌ Bad: Creates new connection, slower, wasteful
for item in items:
    client = AnthropicBedrock()  # New client each time!
    response = client.messages.create(...)

# ✅ Good: Reuse client
client = AnthropicBedrock()
for item in items:
    response = client.messages.create(...)
```

**Impact:**
- 10-50% slower
- Higher connection overhead
- Wastes memory

### Pitfall 2: Unbounded Conversation History

**Problem:** Never trimming conversation history

```python
# ❌ Bad: Conversation grows unbounded
for user_input in inputs:
    conversation.append({"role": "user", "content": user_input})
    response = client.messages.create(messages=conversation)
    conversation.append({"role": "assistant", "content": response})
    # Memory grows: O(n) tokens per request

# ✅ Good: Bounded history
MAX_HISTORY = 20
conversation.append({"role": "user", "content": user_input})
response = client.messages.create(messages=conversation[-MAX_HISTORY:])
conversation.append({"role": "assistant", "content": response})

if len(conversation) > MAX_HISTORY:
    conversation = conversation[-MAX_HISTORY:]
```

**Impact:**
- Exponential cost growth
- Slower requests
- Eventually hits token limits

### Pitfall 3: No Error Handling

**Problem:** Not handling transient failures

```python
# ❌ Bad: Fails on any rate limit
response = client.messages.create(...)  # May fail!

# ✅ Good: Handles transient failures
for attempt in range(3):
    try:
        return client.messages.create(...)
    except RateLimitError:
        if attempt < 2:
            time.sleep(2 ** attempt)
        else:
            raise
```

**Impact:**
- Unreliable (10-30% failure rate under load)
- Poor user experience
- Lost revenue

### Pitfall 4: Hardcoded Credentials

**Problem:** Credentials in source code

```python
# ❌ Bad: Security risk
client = AnthropicBedrock(
    aws_access_key="AKIA...",
    aws_secret_key="..."
)

# ✅ Good: Environment-based
client = AnthropicBedrock(aws_region="us-west-2")
# Reads from environment or IAM role
```

**Impact:**
- Security breach risk
- Difficult to rotate credentials
- Fails in secure environments

### Pitfall 5: Ignoring Token Limits

**Problem:** Not tracking token usage

```python
# ❌ Bad: No token tracking
response = client.messages.create(
    max_tokens=4096  # Too high! Wastes tokens
)

# ✅ Good: Appropriate limits + tracking
response = client.messages.create(
    max_tokens=256
)
logging.info(f"Tokens: {response.usage.output_tokens}")
```

**Impact:**
- 2-5x higher costs
- Wasteful resource usage

---

## Advanced Techniques

### Technique 1: Prompt Engineering for Cost

**Approach:** Structure prompts for efficiency

```python
# ❌ Inefficient (many tokens)
prompt = """
Please analyze the following data and provide a comprehensive report
including all possible insights, interpretations, and recommendations.
Make sure to include every detail and consider all perspectives...
"""

# ✅ Efficient (fewer tokens, same quality)
prompt = """
Analyze data. Key insights only.
"""
```

**Cost Impact:**
- 50-70% token reduction
- Same quality output
- Faster responses

### Technique 2: Batch Processing

**Approach:** Process multiple items efficiently

```python
def batch_process(items, batch_size=10):
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]

        # Process batch in one request
        prompt = f"Analyze these {len(batch)} items: {batch}"
        response = client.messages.create(
            messages=[{"role": "user", "content": prompt}]
        )

        # Extract results from response
        yield parse_results(response.content[0].text)
```

**Cost Impact:**
- 30-40% cheaper (batch overhead)
- Parallelizable
- Better throughput

### Technique 3: Caching Repeated Prompts

**Approach:** Store/reuse responses for common prompts

```python
import hashlib

cache = {}

def get_response(prompt):
    # Hash prompt for cache key
    key = hashlib.md5(prompt.encode()).hexdigest()

    if key in cache:
        return cache[key]  # Cache hit!

    # Cache miss: call API
    response = client.messages.create(
        messages=[{"role": "user", "content": prompt}]
    )

    cache[key] = response.content[0].text
    return cache[key]
```

**Cost Impact:**
- 10-50% reduction (depends on repetition)
- Instant response for cached queries
- Memory trade-off

### Technique 4: Fallback Models

**Approach:** Use cheaper models with fallback to expensive ones

```python
def get_response(prompt, use_sonnet=False):
    try:
        # Try Haiku first (cheaper)
        response = client.messages.create(
            model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
            messages=[{"role": "user", "content": prompt}]
        )
        return response

    except Exception as e:
        if use_sonnet:
            # Fall back to Sonnet for complex tasks
            response = client.messages.create(
                model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
                messages=[{"role": "user", "content": prompt}]
            )
            return response
        raise
```

**Cost Impact:**
- 50-70% average cost reduction
- Transparent fallback
- Quality guarantee

---

## Production Deployment

### Deployment Checklist

```bash
Authentication
  ☐ No hardcoded credentials
  ☐ Using IAM roles (AWS) or service accounts (GCP)
  ☐ Secrets rotated regularly
  ☐ Audit logging enabled

Error Handling
  ☐ Exponential backoff implemented
  ☐ All error types classified
  ☐ Graceful degradation
  ☐ Fallback mechanisms

Performance
  ☐ Client reused across requests
  ☐ Streaming used for long responses
  ☐ Conversation history bounded
  ☐ Timeouts configured

Monitoring
  ☐ Request logging enabled
  ☐ Token usage tracked
  ☐ Error rates monitored
  ☐ Latency metrics collected

Cost Management
  ☐ Appropriate model selection
  ☐ Max tokens limits set
  ☐ Batch processing used
  ☐ Caching implemented

Testing
  ☐ Unit tests written
  ☐ Integration tests passing
  ☐ Load testing completed
  ☐ Security review done
```

### Deployment Architecture

```text
┌─────────────────────┐
│   Load Balancer     │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼───┐
│Worker │    │Worker │  (Multiple instances)
└───┬───┘    └───┬───┘
    │            │
    └──────┬─────┘
           │
    ┌──────▼──────────┐
    │  Connection     │
    │  Pool (Bedrock) │  (Reused clients)
    └─────────────────┘
```

### Scaling Strategies

**Horizontal Scaling:**
```python
# Multiple workers, each with own client
client = AnthropicBedrock()  # Per-worker client

# Queue-based processing
queue.get()  # Get job
response = client.messages.create(...)  # Process
queue.put_result()  # Store result
```

**Rate Limiting:**
```python
from time import sleep
from queue import Queue

queue = Queue()

def worker():
    while True:
        job = queue.get()
        try:
            response = client.messages.create(...)
        except RateLimitError:
            # Re-queue with backoff
            sleep(2)
            queue.put(job)
```

---

## Case Studies

### Case Study 1: Document Analysis System

**Requirements:**
- Process 10,000 documents/day
- Extract structured data
- Cost-conscious

**Solution:**

```python
# Use Haiku + streaming + batching
def process_documents(documents):
    for batch in batches(documents, size=5):
        prompt = f"Extract data from {len(batch)} documents: {batch}"

        with client.messages.stream(
            model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=256
        ) as stream:
            for text in stream.text_stream:
                yield text  # Stream results
```

**Results:**
- 70% cost reduction vs Sonnet
- 3x throughput (batching)
- Real-time streaming feedback

### Case Study 2: Interactive Chatbot

**Requirements:**
- Real-time responses
- Context persistence
- Cost-effective

**Solution:**

```python
class Chatbot:
    def __init__(self):
        self.client = AnthropicBedrock()
        self.history = []

    def respond(self, user_input):
        self.history.append({
            "role": "user",
            "content": user_input
        })

        # Trim history to 10 exchanges (20 messages)
        if len(self.history) > 20:
            self.history = self.history[-20:]

        # Stream response
        with self.client.messages.stream(
            model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
            system="Be helpful and concise",
            messages=self.history,
            max_tokens=256
        ) as stream:
            response_text = ""
            for text in stream.text_stream:
                print(text, end="", flush=True)
                response_text += text

            self.history.append({
                "role": "assistant",
                "content": response_text
            })

            return response_text
```

**Results:**
- Instant user feedback (streaming)
- Bounded memory usage (bounded history)
- Production-ready

### Case Study 3: Automated Code Review

**Requirements:**
- Analyze pull requests
- Provide feedback
- Parallel processing

**Solution:**

```python
from concurrent.futures import ThreadPoolExecutor

class CodeReviewer:
    def __init__(self):
        self.client = AnthropicBedrock()

    def review_file(self, filepath, code):
        response = self.client.messages.create(
            model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
            messages=[{
                "role": "user",
                "content": f"Review this code:\n{code}"
            }],
            max_tokens=512
        )
        return {
            "file": filepath,
            "review": response.content[0].text
        }

    def review_pr(self, files):
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(self.review_file, path, code)
                for path, code in files.items()
            ]
            return [f.result() for f in futures]
```

**Results:**
- Parallel processing (5x faster)
- Error-resistant (per-file isolation)
- Comprehensive feedback

---

## Summary: Best Practices Hierarchy

### Level 1: Must Have (Production-Essential)

1. ✅ Error handling with retries
2. ✅ Environment-based credentials
3. ✅ Client reuse
4. ✅ Logging/monitoring

### Level 2: Should Have (Performance)

1. ✅ Streaming for long responses
2. ✅ Token tracking
3. ✅ Bounded conversation history
4. ✅ Appropriate max_tokens

### Level 3: Nice to Have (Optimization)

1. ✅ Prompt caching
2. ✅ Batch processing
3. ✅ Fallback models
4. ✅ Advanced monitoring

---

## Quick Reference

```python
# Basic Setup (5 minutes)
from anthropic import AnthropicBedrock
client = AnthropicBedrock(aws_region="us-west-2")

# Simple Request
response = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[{"role": "user", "content": "Hello"}]
)

# With Error Handling
try:
    response = client.messages.create(...)
except RateLimitError:
    time.sleep(2 ** attempt)

# With Streaming
with client.messages.stream(...) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

# With Conversation
history = []
history.append({"role": "user", "content": "Hi"})
response = client.messages.create(messages=history)
history.append({"role": "assistant", "content": response.content[0].text})
```

---

**Last Updated:** November 2025
**Status:** Production-Ready Reference
**Complexity:** Intermediate to Advanced
