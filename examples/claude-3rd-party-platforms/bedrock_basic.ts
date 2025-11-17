/**
 * AWS Bedrock - Basic Claude Usage Example (TypeScript)
 *
 * This example demonstrates:
 * - Initializing AnthropicBedrock client
 * - Sending simple messages
 * - Handling responses
 *
 * Setup:
 *     npm install @anthropic-ai/bedrock-sdk
 *
 * Usage:
 *     npx ts-node bedrock_basic.ts
 */

import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

async function main() {
  // Initialize client (uses AWS credentials from environment or ~/.aws/credentials)
  const client = new AnthropicBedrock({
    awsRegion: 'us-west-2'
  });

  console.log('🔷 AWS Bedrock - Basic Claude Usage\n');

  // Send a simple message
  console.log('Sending message to Claude...');
  const message = await client.messages.create({
    model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: 'What is the capital of Germany? Answer in one sentence.'
      }
    ]
  });

  // Extract and print response
  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';
  console.log(`\n✅ Response:\n${responseText}\n`);

  // Show additional metadata
  console.log('📊 Token Usage:');
  console.log(`  Input tokens: ${message.usage.input_tokens}`);
  console.log(`  Output tokens: ${message.usage.output_tokens}`);
  console.log(`  Stop reason: ${message.stop_reason}`);
}

main().catch(console.error);
