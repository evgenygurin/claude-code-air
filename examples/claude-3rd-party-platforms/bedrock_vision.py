"""
AWS Bedrock - Vision/Image Processing Example

This example demonstrates:
- Sending images to Claude
- Base64 encoding
- Vision understanding capabilities

Setup:
    pip install -U "anthropic[bedrock]"
    aws configure

Usage:
    python bedrock_vision.py <path_to_image>

Example:
    python bedrock_vision.py /path/to/image.png
"""

import base64
import sys
from pathlib import Path
from anthropic import AnthropicBedrock


def encode_image(image_path):
    """
    Encode image file to base64.

    Args:
        image_path: Path to image file

    Returns:
        Tuple of (base64_data, media_type)
    """

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    # Determine media type from extension
    extension = path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp"
    }

    if extension not in media_types:
        raise ValueError(f"Unsupported image type: {extension}")

    media_type = media_types[extension]

    # Read and encode image
    with open(image_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    return image_data, media_type


def main():
    """Process image with Claude vision."""

    if len(sys.argv) < 2:
        print("Usage: python bedrock_vision.py <path_to_image>")
        print("\nExample: python bedrock_vision.py /path/to/image.png")
        sys.exit(1)

    image_path = sys.argv[1]

    print("🔷 AWS Bedrock - Vision/Image Processing\n")

    # Encode image
    print(f"Loading image: {image_path}")
    try:
        image_data, media_type = encode_image(image_path)
    except (FileNotFoundError, ValueError) as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

    # Initialize client
    client = AnthropicBedrock(aws_region="us-west-2")

    # Send image to Claude
    print("Analyzing image with Claude...\n")

    response = client.messages.create(
        model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data
                        }
                    },
                    {
                        "type": "text",
                        "text": (
                            "Describe this image in detail. "
                            "What do you see? What are the main elements?"
                        )
                    }
                ]
            }
        ]
    )

    # Print analysis
    print("✅ Analysis:\n")
    print(response.content[0].text)
    print(f"\n📊 Token Usage:")
    print(f"  Input tokens: {response.usage.input_tokens}")
    print(f"  Output tokens: {response.usage.output_tokens}")


if __name__ == "__main__":
    main()
