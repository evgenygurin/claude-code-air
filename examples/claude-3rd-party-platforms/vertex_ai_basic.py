"""
Google Vertex AI - Basic Claude Usage Example

This example demonstrates:
- Initializing AnthropicVertex client
- Sending simple messages
- Handling responses

Setup:
    pip install -U google-cloud-aiplatform "anthropic[vertex]"
    gcloud auth application-default login

Usage:
    python vertex_ai_basic.py
"""

from anthropic import AnthropicVertex


def main():
    """Basic Vertex AI usage example."""

    # Initialize client (uses GCP credentials from environment)
    # Set YOUR_PROJECT_ID to your actual GCP project
    client = AnthropicVertex(
        project_id="YOUR_PROJECT_ID",  # Replace with your GCP project ID
        region="global"  # or "us-east1", "europe-west1", etc.
    )

    print("🔵 Google Vertex AI - Basic Claude Usage\n")

    # Send a simple message
    print("Sending message to Claude...")
    message = client.messages.create(
        model="claude-sonnet-4-5@20250929",
        max_tokens=256,
        messages=[
            {
                "role": "user",
                "content": "What is the capital of Japan? Answer in one sentence."
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
