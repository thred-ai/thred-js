/**
 * TypeScript types for Thred API
 * Generated from OpenAPI specification
 */

/**
 * Information about a brand used in enrichment
 */
export type BrandInfo = {
  /** Unique identifier for the brand */
  id: string;
  /** Name of the brand */
  name: string;
  /** Domain of the brand's website */
  domain: string;
} | null;

/**
 * Request payload for generating an AI response
 */
export type AnswerRequest = {
  /** The user's message or question to process */
  message: string;
  /** The OpenAI model to use for generation */
  model?: "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo";
  /** Maximum number of tokens to generate (overridden by brand settings) */
  maxTokens?: number;
  /** Sampling temperature (overridden by brand settings) */
  temperature?: number;
  /** Additional instructions for the AI response */
  instructions?: string;
  /** ID to track conversation context */
  conversationId?: string;

  /** Previous messages in the conversation */
  previousMessages?: Message[];
};

/**
 * Message object for the AI
 */
export type Message = {
  /** The role of the message */
  role: "user" | "assistant";
  /** The content of the message */
  content: string;
};

/**
 * Target elements for the response
 */
export type Targets = {
  /** The text to set in the target element */
  text?: string | HTMLElement;
  /** The link to set in the target element */
  link?: string | HTMLElement;
};

/**
 * Response from the AI generation endpoint
 */
export type AnswerResponse = {
  /** The generated AI response with brand enrichment */
  response: string;

  metadata: AnswerMetadata;
};

export type AnswerMetadata = {
  /** Information about the brand used in enrichment */
  brandUsed?: BrandInfo;
  /** Affiliate or tracking link for the brand */
  link?: string;
  /** Tracking code for the action */
  code?: string;
  /** Similarity score for brand matching */
  similarityScore?: number;
  /** List of trigger phrases configured for the brand */
  triggerPhrases?: string[];
  /** List of trigger phrases that matched */
  matchedTriggers?: string[];
};

/**
 * Error response from the API
 */
export type ErrorResponse = {
  /** Error type or category */
  error: string;
  /** Detailed error message */
  message?: string;
};

/**
 * Configuration options for the Thred client
 */
export type ThredConfig = {
  /** API key for authentication */
  apiKey: string;
  /** Default model to use for requests */
  defaultModel?: "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo";
  /** Request timeout in milliseconds */
  timeout?: number;
};

/**
 * Streaming response with metadata
 */
export type StreamingResponse = {
  /** The text content stream */
  stream: ReadableStream<string>;
  /** Brand metadata from response headers */
  metadata: {
    brandId?: string;
    brandName?: string;
    brandDomain?: string;
    similarityScore?: number;
  };
};
