"""
AWS Bedrock - Basic Claude Usage Example

This example demonstrates:
- Initializing AnthropicBedrock client
- Sending simple messages
- Handling responses

Setup:
    pip install -U "anthropic[bedrock]"
    aws configure

Usage:
    python bedrock_basic.py
"""

from anthropic import AnthropicBedrock


def main():
    """Basic Bedrock usage example."""

    # Initialize client (uses AWS credentials from environment or ~/.aws/credentials)
    client = AnthropicBedrock(aws_region="us-west-2")

    print("🔷 AWS Bedrock - Basic Claude Usage\n")

    # Send a simple message
    print("Sending message to Claude...")
    message = client.messages.create(
        model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
        max_tokens=256,
        messages=[
            {
                "role": "user",
                "content": "What is the capital of France? Answer in one sentence."
            }
        ]
    )

    # Extract and print response
    response_text = message.content[0].text
    print(f"\n✅ Response:\n{response_text}\n")

    # Show additional metadata
    print(f"📊 Token Usage:")
    print(f"  Input tokens: {message.usage.input_tokens}")
    print(f"  Output tokens: {message.usage.output_tokens}")
    print(f"  Stop reason: {message.stop_reason}")


if __name__ == "__main__":
    main()
