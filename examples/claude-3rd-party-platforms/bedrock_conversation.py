"""
AWS Bedrock - Multi-turn Conversation Example

This example demonstrates:
- Maintaining conversation history
- Multi-turn interactions
- Context persistence across messages

Setup:
    pip install -U "anthropic[bedrock]"
    aws configure

Usage:
    python bedrock_conversation.py
"""

from anthropic import AnthropicBedrock


class ChatSession:
    """Manages multi-turn conversation with Claude on Bedrock."""

    def __init__(self, aws_region="us-west-2"):
        """Initialize chat session."""
        self.client = AnthropicBedrock(aws_region=aws_region)
        self.conversation_history = []
        self.model = "global.anthropic.claude-sonnet-4-5-20250929-v1:0"
        self.system_prompt = (
            "You are a helpful assistant. Be concise and clear in your responses."
        )

    def chat(self, user_message):
        """
        Send message and get response, maintaining conversation history.

        Args:
            user_message: User's message

        Returns:
            Assistant's response
        """

        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Get response from Claude
        response = self.client.messages.create(
            model=self.model,
            max_tokens=512,
            system=self.system_prompt,
            messages=self.conversation_history
        )

        # Extract assistant's response
        assistant_message = response.content[0].text

        # Add assistant's response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })

        return assistant_message

    def show_history(self):
        """Display conversation history."""
        print("\n📝 Conversation History:")
        print("=" * 60)
        for i, msg in enumerate(self.conversation_history, 1):
            role = "👤 You" if msg["role"] == "user" else "🤖 Claude"
            print(f"\n{i}. {role}:")
            print(f"   {msg['content']}")
        print("\n" + "=" * 60)


def main():
    """Run interactive conversation example."""

    print("🔷 AWS Bedrock - Multi-turn Conversation\n")
    print("Type 'quit' to exit, 'history' to show conversation history\n")

    # Initialize chat session
    session = ChatSession()

    # Welcome message
    print("✅ Connected to Claude on Bedrock")
    print("Start chatting (type 'quit' to exit):\n")

    while True:
        # Get user input
        user_input = input("You: ").strip()

        if not user_input:
            continue

        if user_input.lower() == "quit":
            print("\n👋 Goodbye!")
            break

        if user_input.lower() == "history":
            session.show_history()
            continue

        # Get response
        print("\n🤖 Claude: ", end="", flush=True)
        response = session.chat(user_input)
        print(f"{response}\n")


if __name__ == "__main__":
    main()
