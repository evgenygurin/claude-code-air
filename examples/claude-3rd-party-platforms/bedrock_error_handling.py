"""
AWS Bedrock - Error Handling with Retries

This example demonstrates:
- Handling rate limits with exponential backoff
- Retry strategies
- Proper error classification

Setup:
    pip install -U "anthropic[bedrock]"
    aws configure

Usage:
    python bedrock_error_handling.py
"""

import time
from anthropic import AnthropicBedrock, APIError, RateLimitError


def call_with_retry(client, max_retries=3):
    """
    Call Claude API with exponential backoff retry strategy.

    Args:
        client: AnthropicBedrock client instance
        max_retries: Maximum number of retry attempts

    Returns:
        API response or raises exception after max retries
    """

    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1}/{max_retries}...")

            return client.messages.create(
                model="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
                max_tokens=256,
                messages=[
                    {
                        "role": "user",
                        "content": "Explain quantum computing in 2 sentences"
                    }
                ]
            )

        except RateLimitError as e:
            # Handle rate limiting with exponential backoff
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                print(
                    f"⚠️  Rate limited. Waiting {wait_time}s before retry..."
                )
                time.sleep(wait_time)
                continue
            else:
                print("❌ Max retries exceeded due to rate limiting")
                raise

        except APIError as e:
            # Handle other API errors
            error_msg = str(e)

            if "ThrottlingException" in error_msg:
                # Handle throttling similar to rate limits
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"⚠️  Throttled. Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                    continue

            print(f"❌ API Error: {e}")
            raise

        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            raise

    raise Exception("Failed after max retries")


def main():
    """Demonstrate error handling with retries."""

    client = AnthropicBedrock(aws_region="us-west-2")

    print("🔷 AWS Bedrock - Error Handling with Retries\n")

    try:
        response = call_with_retry(client, max_retries=3)
        print(f"\n✅ Success!\n{response.content[0].text}\n")

    except Exception as e:
        print(f"\n❌ Failed: {e}")


if __name__ == "__main__":
    main()
