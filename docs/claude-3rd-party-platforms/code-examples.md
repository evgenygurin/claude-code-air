# Claude on 3rd-Party Platforms - Code Examples

Practical examples for using Claude on AWS Bedrock and Google Vertex AI.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Error Handling](#error-handling)
3. [Streaming Responses](#streaming-responses)
4. [Vision/Images](#vision--images)
5. [System Prompts](#system-prompts)
6. [Advanced Patterns](#advanced-patterns)

---

## Basic Usage

### Bedrock - Python

```python
from anthropic import AnthropicBedrock

# Initialize client
client = AnthropicBedrock(aws_region="us-west-2")

# Simple message
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content[0].text)
```

### Bedrock - TypeScript

```typescript
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

const client = new AnthropicBedrock({
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

### Vertex AI - Python

```python
from anthropic import AnthropicVertex

# Initialize client
client = AnthropicVertex(
    project_id="my-project",
    region="global"  # or "us-east1", etc.
)

# Simple message
message = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content[0].text)
```

### Vertex AI - TypeScript

```typescript
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

const client = new AnthropicVertex({
  projectId: 'my-project',
  region: 'global'  // or 'us-east1', etc.
});

async function main() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5@20250929',
    max_tokens: 256,
    messages: [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  });

  console.log(message.content[0].type === 'text' ? message.content[0].text : '');
}

main().catch(console.error);
```

---

## Error Handling

### Bedrock - Comprehensive Error Handling

```python
from anthropic import AnthropicBedrock, APIError, RateLimitError
import time

client = AnthropicBedrock(aws_region="us-west-2")

def call_with_error_handling(messages, max_retries=3):
    """Call API with comprehensive error handling."""

    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
                max_tokens=256,
                messages=messages
            )

        except RateLimitError as e:
            # Handle rate limiting with exponential backoff
            wait_time = 2 ** attempt
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)
            continue

        except APIError as e:
            # Handle general API errors
            if "ThrottlingException" in str(e):
                wait_time = 2 ** attempt
                print(f"Throttled. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"API Error: {e}")
                raise

        except Exception as e:
            print(f"Unexpected error: {e}")
            raise

    raise Exception("Failed after max retries")

# Use it
try:
    response = call_with_error_handling([
        {"role": "user", "content": "Hello"}
    ])
    print(response.content[0].text)
except Exception as e:
    print(f"Failed: {e}")
```

### Vertex AI - Error Handling

```python
from anthropic import AnthropicVertex, APIError, RateLimitError
import time

client = AnthropicVertex(project_id="my-project", region="global")

def call_with_error_handling(messages, max_retries=3):
    """Call API with comprehensive error handling."""

    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="claude-sonnet-4-5@20250929",
                max_tokens=256,
                messages=messages
            )

        except RateLimitError as e:
            wait_time = 2 ** attempt
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)
            continue

        except APIError as e:
            error_str = str(e)
            if "RESOURCE_EXHAUSTED" in error_str:
                wait_time = 2 ** attempt
                print(f"Resource exhausted. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"API Error: {e}")
                raise

        except Exception as e:
            print(f"Unexpected error: {e}")
            raise

    raise Exception("Failed after max retries")
```

---

## Streaming Responses

### Bedrock - Streaming

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(aws_region="us-west-2")

# Stream response
print("Response: ", end="", flush=True)

with client.messages.stream(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Write a haiku about programming"}
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

print()
```

### Vertex AI - Streaming

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(project_id="my-project", region="global")

# Stream response
print("Response: ", end="", flush=True)

with client.messages.stream(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Write a haiku about programming"}
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

print()
```

### TypeScript - Streaming (Bedrock)

```typescript
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

const client = new AnthropicBedrock({
  awsRegion: 'us-west-2'
});

async function streamExample() {
  console.log("Response: ", end="");

  const stream = await client.messages.stream({
    model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    max_tokens: 256,
    messages: [
      {"role": "user", "content": "Write a haiku about programming"}
    ]
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      process.stdout.write(chunk.delta.text);
    }
  }

  console.log();
}

streamExample().catch(console.error);
```

---

## Vision / Images

### Bedrock - Image Handling

```python
from anthropic import AnthropicBedrock
import base64

client = AnthropicBedrock(aws_region="us-west-2")

# Load image
with open("image.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

# Send with vision
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": "What's in this image?"
                }
            ]
        }
    ]
)

print(message.content[0].text)
```

### Vertex AI - Image Handling

```python
from anthropic import AnthropicVertex
import base64

client = AnthropicVertex(project_id="my-project", region="global")

# Load image
with open("image.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

# Send with vision
message = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": "What's in this image?"
                }
            ]
        }
    ]
)

print(message.content[0].text)
```

---

## System Prompts

### Bedrock - System Prompt

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(aws_region="us-west-2")

# Use system prompt for context
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    system="You are a helpful Python expert. Provide clear, concise explanations.",
    messages=[
        {
            "role": "user",
            "content": "How do I use list comprehensions?"
        }
    ]
)

print(message.content[0].text)
```

### Vertex AI - System Prompt

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(project_id="my-project", region="global")

# Use system prompt for context
message = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    system="You are a helpful Python expert. Provide clear, concise explanations.",
    messages=[
        {
            "role": "user",
            "content": "How do I use list comprehensions?"
        }
    ]
)

print(message.content[0].text)
```

---

## Advanced Patterns

### Multi-Turn Conversation

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(aws_region="us-west-2")

# Maintain conversation history
conversation = []

def chat(user_message):
    """Add message and get response."""
    conversation.append({
        "role": "user",
        "content": user_message
    })

    response = client.messages.create(
        model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
        max_tokens=256,
        system="You are a helpful assistant.",
        messages=conversation
    )

    assistant_message = response.content[0].text
    conversation.append({
        "role": "assistant",
        "content": assistant_message
    })

    return assistant_message

# Have a conversation
print(chat("What is the capital of France?"))
print(chat("How far is it from Paris to Berlin?"))
print(chat("What languages are spoken there?"))
```

### Batch Processing

```python
from anthropic import AnthropicBedrock
import concurrent.futures

client = AnthropicBedrock(aws_region="us-west-2")

def process_text(text):
    """Process a single text."""
    message = client.messages.create(
        model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
        max_tokens=256,
        messages=[
            {"role": "user", "content": f"Summarize: {text}"}
        ]
    )
    return message.content[0].text

# Process multiple texts in parallel
texts = [
    "Long text 1...",
    "Long text 2...",
    "Long text 3..."
]

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(process_text, texts))

for i, result in enumerate(results, 1):
    print(f"Summary {i}: {result}")
```

### Function Calling (Tool Use)

```python
from anthropic import AnthropicBedrock
import json

client = AnthropicBedrock(aws_region="us-west-2")

# Define tools
tools = [
    {
        "name": "calculator",
        "description": "Perform mathematical operations",
        "input_schema": {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "subtract", "multiply", "divide"]
                },
                "a": {"type": "number"},
                "b": {"type": "number"}
            },
            "required": ["operation", "a", "b"]
        }
    }
]

# Use tools in request
message = client.messages.create(
    model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    max_tokens=256,
    tools=tools,
    messages=[
        {
            "role": "user",
            "content": "What is 15 plus 27?"
        }
    ]
)

# Process tool calls
for block in message.content:
    if block.type == "tool_use":
        print(f"Tool: {block.name}")
        print(f"Input: {block.input}")
```

### Prompt Caching (Vertex AI)

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(project_id="my-project", region="global")

# Large context that will be cached
system_prompt = "You are a helpful assistant." * 100  # Make it large

# First request (cache miss)
message1 = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    system=system_prompt,
    messages=[
        {"role": "user", "content": "Hello"}
    ]
)

# Second request (cache hit)
message2 = client.messages.create(
    model="claude-sonnet-4-5@20250929",
    max_tokens=256,
    system=system_prompt,  # Same system prompt cached
    messages=[
        {"role": "user", "content": "Hi again"}
    ]
)
```

---

## Best Practices Summary

1. **Always use error handling** - Implement retries with exponential backoff
2. **Stream for better UX** - Use streaming for long responses
3. **Use system prompts** - Guide Claude's behavior with clear instructions
4. **Maintain conversation history** - Keep messages for context
5. **Handle rate limits** - Implement backoff strategies
6. **Test authentication** - Verify credentials work before production
7. **Monitor costs** - Track API usage and expenses
8. **Use appropriate models** - Haiku for simple tasks, Sonnet for most, Opus for complex reasoning

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Rate limit exceeded" | Implement exponential backoff retry |
| "Credentials error" | Verify AWS/GCP authentication setup |
| "Model not found" | Check model ID and regional availability |
| "Timeout" | Increase max_tokens, use streaming |
| "High costs" | Use Haiku model, optimize token usage |

---

**For more examples, see the official documentation:**
- [Anthropic API Docs](https://docs.anthropic.com)
- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [Google Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)
