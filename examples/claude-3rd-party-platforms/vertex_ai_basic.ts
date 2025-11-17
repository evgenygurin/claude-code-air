/**
 * Google Vertex AI - Basic Claude Usage Example (TypeScript)
 *
 * This example demonstrates:
 * - Initializing AnthropicVertex client
 * - Sending simple messages
 * - Handling responses
 *
 * Setup:
 *     npm install @anthropic-ai/vertex-sdk
 *     gcloud auth application-default login
 *
 * Usage:
 *     npx ts-node vertex_ai_basic.ts
 */

import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

async function main() {
  // Initialize client (uses GCP credentials from environment)
  const client = new AnthropicVertex({
    projectId: 'YOUR_PROJECT_ID',  // Replace with your GCP project ID
    region: 'global'  // or 'us-east1', 'europe-west1', etc.
  });

  console.log('🔵 Google Vertex AI - Basic Claude Usage\n');

  // Send a simple message
  console.log('Sending message to Claude...');
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5@20250929',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: 'What is the capital of Italy? Answer in one sentence.'
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
