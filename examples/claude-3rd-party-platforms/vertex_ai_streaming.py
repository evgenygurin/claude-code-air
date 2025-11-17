"""
Google Vertex AI - Streaming Response Example

This example demonstrates:
- Using streaming for real-time responses
- Token counting with streaming
- Better user experience with immediate feedback

Setup:
    pip install -U google-cloud-aiplatform "anthropic[vertex]"
    gcloud auth application-default login

Usage:
    python vertex_ai_streaming.py
"""

from anthropic import AnthropicVertex


def main():
    """Vertex AI streaming example."""

    client = AnthropicVertex(
        project_id="YOUR_PROJECT_ID",  # Replace with your GCP project ID
        region="global"
    )

    print("🔵 Google Vertex AI - Streaming Response\n")

    prompt = "Write a limerick about machine learning"
    print(f"Prompt: {prompt}\n")
    print("Response (streaming):\n")

    # Stream response
    with client.messages.stream(
        model="claude-sonnet-4-5@20250929",
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
