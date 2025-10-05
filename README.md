# Thred TypeScript SDK

A comprehensive TypeScript SDK for the Thred API that provides AI response generation with brand enrichment.

## Installation

```bash
npm install @thred/sdk
```

## Quick Start

```typescript
import { ThredClient } from '@thred/sdk';

// Initialize the client
const client = new ThredClient({
  apiKey: 'your-api-key-here',
  defaultModel: 'gpt-4', // optional, defaults to gpt-4
  timeout: 30000, // optional, defaults to 30 seconds
});

// Generate a non-streaming response
const response = await client.answer({
  message: "What's the best way to organize my tasks?",
});

console.log(response.response);
console.log(response.brandUsed);
console.log(response.link);
```

## Features

- ✅ Full TypeScript support with type definitions
- ✅ Both streaming and non-streaming response generation
- ✅ Bearer token authentication
- ✅ Comprehensive error handling
- ✅ Timeout support
- ✅ Brand enrichment and tracking
- ✅ Conversation context support
- ✅ Multiple model support (GPT-4, GPT-4 Turbo, GPT-3.5 Turbo)

## API Reference

### ThredClient

The main client class for interacting with the Thred API.

#### Constructor

```typescript
new ThredClient(config: thredconfig)
```

**Configuration Options:**

- `apiKey` (required): Your Thred API key
- `defaultModel` (optional): Default model to use (defaults to `gpt-4`)
- `timeout` (optional): Request timeout in milliseconds (defaults to 30000)

### Methods

#### `answer(request: answerrequest): Promise<answerresponse>`

Generate a complete AI response with brand enrichment (non-streaming).

**Parameters:**

- `message` (required): The user's message or question
- `model` (optional): OpenAI model to use (`gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`)
- `maxTokens` (optional): Maximum tokens to generate
- `temperature` (optional): Sampling temperature (0-2)
- `instructions` (optional): Additional instructions for the AI
- `conversationId` (optional): ID to track conversation context
- `customerId` (optional): ID of the customer making the request
- `isTest` (optional): Whether this is a test request

**Returns:**

An `answerresponse` object containing:
- `response`: The generated AI response text
- `model`: The model used for generation
- `brandUsed`: Information about the matched brand (if any)
- `link`: Affiliate or tracking link (if applicable)
- `similarityScore`: Brand match similarity score
- `triggerPhrases`: Configured trigger phrases
- `matchedTriggers`: Triggers that matched in the message

**Example:**

```typescript
const response = await client.answer({
  message: "How can I improve my productivity?",
  model: "gpt-4",
  instructions: "Be concise and practical",
  conversationId: "conv_12345",
});

console.log(response.response);
if (response.brandUsed) {
  console.log(`Brand: ${response.brandUsed.name}`);
  console.log(`Link: ${response.link}`);
}
```

#### `answerStream(request: answerrequest, onChunk: (accumulatedText: string) => void): Promise<streammetadata | null>`

Generate a streaming AI response with brand enrichment using a callback function.

**Parameters:**

- `request`: Same as the `answer` method
- `onChunk`: Callback function called with the full accumulated text so far (not individual chunks)

**Returns:**

A promise that resolves to the metadata object after streaming completes.

**Example:**

```typescript
const metadata = await client.answerStream(
  {
    message: "Tell me about task management tools",
    model: "gpt-4",
  },
  (accumulatedText) => {
    // Clear console and write the full text so far
    console.clear();
    console.log(accumulatedText);
  }
);

if (metadata?._metadata.brandUsed) {
  console.log(`\n\nBrand: ${metadata._metadata.brandUsed.name}`);
}
```

#### `answerStreamGenerator(request: answerrequest): AsyncGenerator<string | { metadata: streammetadata }>`

Generate a streaming AI response using an async generator (alternative API).

**Parameters:**

- `request`: Same as the `answer` method

**Returns:**

An async generator that yields the accumulated text so far and a final metadata object.

**Example:**

```typescript
for await (const result of client.answerStreamGenerator({
  message: "What are the best productivity apps?",
})) {
  if (typeof result === 'string') {
    // Clear console and display accumulated text
    console.clear();
    console.log(result);
  } else {
    // Final metadata
    console.log('\n\nMetadata:', result.metadata);
  }
}
```

## Error Handling

The SDK provides specific error classes for different error scenarios:

```typescript
import { 
  ThredError,
  AuthenticationError,
  ValidationError,
  ServerError,
  NetworkError,
  TimeoutError,
} from '@thred/sdk';

try {
  const response = await client.answer({
    message: "Hello!",
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Invalid request:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof ServerError) {
    console.error('Server error:', error.message);
  } else if (error instanceof ThredError) {
    console.error('API error:', error.message);
    console.error('Status code:', error.statusCode);
  }
}
```

## TypeScript Types

All types are exported and available for use:

```typescript
import type {
  thredconfig,
  answerrequest,
  answerresponse,
  brandinfo,
  streammetadata,
  errorresponse,
} from '@thred/sdk';
```

## Advanced Usage

### Conversation Context

```typescript
const conversationId = 'conv_12345';

// First message
const response1 = await client.answer({
  message: "What's a good task management tool?",
  conversationId,
});

// Follow-up message with same conversationId
const response2 = await client.answer({
  message: "Does it have a mobile app?",
  conversationId,
});
```

### Custom Timeout

```typescript
const client = new ThredClient({
  apiKey: 'your-api-key',
  timeout: 60000, // 60 seconds
});
```

### Model Selection

```typescript
// Use GPT-4 Turbo for faster responses
const response = await client.answer({
  message: "Quick question about productivity",
  model: "gpt-4-turbo",
});

// Use GPT-3.5 Turbo for cost-effective responses
const response2 = await client.answer({
  message: "Simple task organization tips",
  model: "gpt-3.5-turbo",
});
```

## License

MIT

## Support

For support, please contact Thred API Support or visit [https://thred.dev](https://thred.dev).

