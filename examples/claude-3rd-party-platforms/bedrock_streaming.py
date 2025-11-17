"""
AWS Bedrock - Streaming Response Example

This example demonstrates:
- Using streaming for real-time responses
- Token counting with streaming
- Better user experience with immediate feedback

Setup:
    pip install -U "anthropic[bedrock]"
    aws configure

Usage:
    python bedrock_streaming.py
"""

from anthropic import AnthropicBedrock


def main():
    """Bedrock streaming example."""

    client = AnthropicBedrock(aws_region="us-west-2")

    print("🔷 AWS Bedrock - Streaming Response\n")

    prompt = "Write a haiku about artificial intelligence"
    print(f"Prompt: {prompt}\n")
    print("Response (streaming):\n")

    # Stream response
    with client.messages.stream(
        model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
        max_tokens=256,
        messages=[
            {"role": "user", "content": prompt}
        ]
    ) as stream:
        # Print each chunk as it arrives
        for text in stream.text_stream:
            print(text, end="", flush=True)

    # Get final message for token counts
    final_message = stream.get_final_message()
    print(f"\n\n📊 Token Usage:")
    print(f"  Input tokens: {final_message.usage.input_tokens}")
    print(f"  Output tokens: {final_message.usage.output_tokens}")


if __name__ == "__main__":
    main()
