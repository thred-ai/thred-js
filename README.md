# Thred SDK

[![npm version](https://img.shields.io/npm/v/@thred-apps/thred-js.svg)](https://www.npmjs.com/package/@thred-apps/thred-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A comprehensive TypeScript SDK for the Thred API that provides AI-powered response generation with intelligent brand enrichment and affiliate integration.

## Features

- 🤖 **AI Response Generation** - Powered by OpenAI's GPT models (GPT-4, GPT-4 Turbo, GPT-3.5 Turbo)
- 🎯 **Smart Brand Enrichment** - Automatically enriches responses with relevant brand recommendations
- 📡 **Streaming Support** - Real-time streaming responses with multiple consumption patterns
- 🔗 **Affiliate Integration** - Built-in tracking and impression registration
- 💬 **Conversation Context** - Maintain context across multiple interactions
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive type definitions
- ⚡ **Performance** - Configurable timeouts and efficient streaming
- 🎨 **DOM Integration** - Direct DOM manipulation for web applications
- 🚨 **Robust Error Handling** - Specific error types for different failure scenarios

## Installation

```bash
npm install @thred-apps/thred-js
```

```bash
yarn add @thred-apps/thred-js
```

```bash
pnpm add @thred-apps/thred-js
```

## Quick Start

```typescript
import { ThredClient } from '@thred-apps/thred-js';

// Initialize the client
const client = new ThredClient({
  apiKey: 'your-api-key-here',
  defaultModel: 'gpt-4',
  timeout: 30000, // optional, defaults to 30s
});

// Generate a response
const response = await client.answer({
  message: 'What are the best productivity tools?',
});

console.log(response.response);
```

## API Documentation

### ThredClient

#### Constructor

```typescript
new ThredClient(config: ThredConfig)
```

**Configuration Options:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `apiKey` | `string` | ✓ | - | Your Thred API key |
| `defaultModel` | `"gpt-4"` \| `"gpt-4-turbo"` \| `"gpt-3.5-turbo"` | ✗ | `"gpt-4"` | Default model for requests |
| `timeout` | `number` | ✗ | `30000` | Request timeout in milliseconds |

### Methods

#### answer()

Generate an AI response with brand enrichment (non-streaming).

```typescript
async answer(
  request: AnswerRequest,
  targets?: Targets
): Promise<AnswerResponse>
```

**Parameters:**

```typescript
type AnswerRequest = {
  message: string;                                      // User's message/question
  model?: "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo";  // Model to use
  maxTokens?: number;                                   // Max tokens to generate
  temperature?: number;                                 // Sampling temperature
  instructions?: string;                                // Additional instructions
  conversationId?: string;                              // Conversation tracking ID
  previousMessages?: Message[];                         // Previous conversation messages
};

type Targets = {
  text?: string | HTMLElement;   // Target for response text
  link?: string | HTMLElement;   // Target for affiliate link
};
```

**Returns:**

```typescript
type AnswerResponse = {
  response: string;
  metadata: {
    brandUsed?: {
      id: string;
      name: string;
      domain: string;
    } | null;
    link?: string;
    code?: string;
    similarityScore?: number;
    triggerPhrases?: string[];
    matchedTriggers?: string[];
  };
};
```

**Example:**

```typescript
const response = await client.answer({
  message: 'What project management tool should I use?',
  model: 'gpt-4-turbo',
  instructions: 'Be concise and practical',
  temperature: 0.7,
});

console.log(response.response);
console.log('Brand:', response.metadata.brandUsed?.name);
```

#### answerStream()

Generate a streaming AI response with a callback function.

```typescript
async answerStream(
  request: AnswerRequest,
  onChunk: (accumulatedText: string) => void,
  targets?: Targets
): Promise<AnswerResponse | null>
```

**Parameters:**

- `request` - The answer request (same as `answer()`)
- `onChunk` - Callback function receiving accumulated text as streaming progresses
- `targets` - Optional DOM targets for automatic response rendering

**Example:**

```typescript
const metadata = await client.answerStream(
  {
    message: 'How can I improve my productivity?',
    model: 'gpt-4',
  },
  (accumulatedText) => {
    // Update your UI with the accumulated text
    document.getElementById('response').textContent = accumulatedText;
  }
);

console.log('Final brand:', metadata?.metadata.brandUsed?.name);
```

#### answerStreamGenerator()

Generate a streaming AI response using async generators.

```typescript
async *answerStreamGenerator(
  request: AnswerRequest
): AsyncGenerator<string | { metadata: AnswerResponse }, void, unknown>
```

**Example:**

```typescript
for await (const chunk of client.answerStreamGenerator({
  message: 'What are the best productivity apps?',
})) {
  if (typeof chunk === 'string') {
    // Accumulated text update
    console.log('Text:', chunk);
  } else {
    // Final metadata
    console.log('Brand:', chunk.metadata.metadata.brandUsed?.name);
  }
}
```

#### setResponse()

Manually set response in DOM targets and register impression.

```typescript
async setResponse(
  text: string,
  code: string,
  link?: string,
  targets?: Targets
): Promise<void>
```

## Usage Examples

### Basic Non-Streaming Response

```typescript
import { ThredClient } from '@thred-apps/thred-js';

const client = new ThredClient({
  apiKey: process.env.THRED_API_KEY!,
});

const response = await client.answer({
  message: 'What are the best CRM tools for small businesses?',
});

console.log(response.response);

if (response.metadata.brandUsed) {
  console.log(`Recommended: ${response.metadata.brandUsed.name}`);
  console.log(`Learn more: ${response.metadata.link}`);
}
```

### Streaming with Real-time Updates

```typescript
const metadata = await client.answerStream(
  {
    message: 'Explain agile project management',
    model: 'gpt-4-turbo',
    instructions: 'Use simple language',
  },
  (text) => {
    // Update UI in real-time
    document.getElementById('ai-response').innerHTML = text;
  }
);
```

### Using Async Generators

```typescript
async function streamResponse() {
  let fullText = '';
  
  for await (const chunk of client.answerStreamGenerator({
    message: 'What are cloud storage options?',
    model: 'gpt-4',
  })) {
    if (typeof chunk === 'string') {
      fullText = chunk;
      updateUI(fullText);
    } else {
      // Handle final metadata
      console.log('Similarity score:', chunk.metadata.metadata.similarityScore);
    }
  }
}
```

### Conversation Context

```typescript
const conversationId = `conv_${Date.now()}`;

// First message
const response1 = await client.answer({
  message: 'What email marketing tool do you recommend?',
  conversationId,
});

// Follow-up question with context
const response2 = await client.answer({
  message: 'Does it integrate with Shopify?',
  conversationId,
});
```

### DOM Integration

```typescript
// Automatically populate DOM elements
await client.answer(
  {
    message: 'Best accounting software for freelancers?',
  },
  {
    text: 'response-container',  // Element ID or HTMLElement
    link: document.getElementById('affiliate-link'),
  }
);
```

### Custom Model Selection

```typescript
// GPT-4 for complex queries
const detailed = await client.answer({
  message: 'Compare enterprise project management solutions',
  model: 'gpt-4',
  maxTokens: 1000,
});

// GPT-3.5 Turbo for quick responses
const quick = await client.answer({
  message: 'Quick tips for time management',
  model: 'gpt-3.5-turbo',
  maxTokens: 150,
});
```

### Previous Messages Context

```typescript
const response = await client.answer({
  message: 'What features should I look for?',
  previousMessages: [
    {
      role: 'user',
      content: 'I need a CRM for my small business',
    },
    {
      role: 'assistant',
      content: 'I recommend looking at HubSpot or Salesforce...',
    },
  ],
});
```

## Error Handling

The SDK provides specific error classes for different failure scenarios:

```typescript
import {
  ThredError,
  AuthenticationError,
  ValidationError,
  ServerError,
  NetworkError,
  TimeoutError,
} from '@thred-apps/thred-js';

try {
  const response = await client.answer({
    message: 'What are the best tools?',
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof ValidationError) {
    console.error('Invalid request:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request took too long');
  } else if (error instanceof NetworkError) {
    console.error('Network connection failed');
  } else if (error instanceof ServerError) {
    console.error('Server error:', error.message);
  } else if (error instanceof ThredError) {
    console.error(`API error (${error.statusCode}):`, error.message);
  }
}
```

### Error Properties

All error classes extend `ThredError` and include:

```typescript
class ThredError extends Error {
  statusCode?: number;      // HTTP status code
  response?: ErrorResponse; // API error response
}
```

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type {
  ThredConfig,
  AnswerRequest,
  AnswerResponse,
  BrandInfo,
  Targets,
  AnswerMetadata,
  ErrorResponse,
  StreamingResponse,
  Message,
} from '@thred-apps/thred-js';
```

All types are fully documented with JSDoc comments for excellent IDE autocomplete support.

## Response Format

### Non-Streaming Response

```json
{
  "response": "Based on your needs, I'd recommend HubSpot CRM...",
  "metadata": {
    "brandUsed": {
      "id": "brand_123",
      "name": "HubSpot",
      "domain": "hubspot.com"
    },
    "link": "https://partner.hubspot.com/...",
    "code": "track_abc123",
    "similarityScore": 0.92,
    "triggerPhrases": ["crm", "customer management"],
    "matchedTriggers": ["crm"]
  }
}
```

### Streaming Response

Streams the response text in real-time, followed by metadata:

```
This is the streaming response text...

{"response": "...", "metadata": {...}}
```

## Best Practices

### 1. Secure API Key Management

```typescript
// ✅ Good - Use environment variables
const client = new ThredClient({
  apiKey: process.env.THRED_API_KEY!,
});

// ❌ Bad - Hardcoded API key
const client = new ThredClient({
  apiKey: 'sk_live_123...',
});
```

### 2. Error Handling

```typescript
// ✅ Good - Specific error handling
try {
  const response = await client.answer({ message });
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle auth error
  } else if (error instanceof ValidationError) {
    // Handle validation error
  }
}
```

### 3. Streaming for Long Responses

```typescript
// ✅ Good - Use streaming for better UX
await client.answerStream(
  { message: longQuery },
  (text) => updateUI(text)
);

// ❌ Less ideal - Non-streaming for long responses
const response = await client.answer({ message: longQuery });
updateUI(response.response); // User waits for full response
```

### 4. Conversation Context

```typescript
// ✅ Good - Maintain conversation ID
const convId = generateConversationId();
await client.answer({ message: msg1, conversationId: convId });
await client.answer({ message: msg2, conversationId: convId });

// ❌ Bad - No context between messages
await client.answer({ message: msg1 });
await client.answer({ message: msg2 });
```

### 5. Timeout Configuration

```typescript
// ✅ Good - Adjust timeout based on use case
const client = new ThredClient({
  apiKey: process.env.THRED_API_KEY!,
  timeout: 60000, // 60s for complex queries
});
```

## Browser Support

The SDK uses modern JavaScript features and requires:

- ES2020+
- Fetch API
- ReadableStream
- TextDecoder
- AbortController

All modern browsers (Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+) are supported.

## Node.js Support

Requires Node.js 16.0.0 or higher.

For Node.js environments, ensure you have a fetch polyfill if using Node < 18:

```bash
npm install node-fetch
```

```typescript
// For Node.js < 18
import fetch from 'node-fetch';
global.fetch = fetch;
```

## License

MIT © Thred API Support

## Support

- **Documentation:** [https://thred.dev](https://thred.dev)
- **Issues:** [GitHub Issues](https://github.com/thred-ai/thred-js/issues)
- **Email:** support@thred.dev

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by the Thred team
