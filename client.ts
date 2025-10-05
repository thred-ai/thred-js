/**
 * Thred API Client
 */

import type { ThredConfig, AnswerRequest, AnswerResponse } from "./types";
import { handleApiError, NetworkError, TimeoutError } from "./errors";

/**
 * Main client for interacting with the Thred API
 */
export class ThredClient {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://api.thred.dev/v1";
  private readonly defaultModel: "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo";
  private readonly timeout: number;

  /**
   * Create a new Thred API client
   * @param config - Configuration options for the client
   */
  constructor(config: ThredConfig) {
    if (!config.apiKey) {
      throw new Error("API key is required");
    }

    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || "gpt-4";
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Get common headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Make a fetch request with timeout support
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(`Request timed out after ${timeout}ms`);
      }
      throw new NetworkError(
        error instanceof Error ? error.message : "Network request failed"
      );
    }
  }

  /**
   * Generate an AI response with brand enrichment (non-streaming)
   * @param request - The answer request payload
   * @returns Promise resolving to the answer response
   */
  async answer(request: AnswerRequest): Promise<AnswerResponse> {
    if (!request.message || request.message.trim().length === 0) {
      throw new Error("Message is required");
    }

    const payload: AnswerRequest = {
      ...request,
      model: (request.model || this.defaultModel) as
        | "gpt-4"
        | "gpt-4-turbo"
        | "gpt-3.5-turbo",
    };

    const url = `${this.baseUrl}/answer`;
    const response = await this.fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      },
      this.timeout
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  }

  /**
   * Generate a streaming AI response with brand enrichment
   * @param request - The answer request payload
   * @param onChunk - Callback function called with the accumulated text so far
   * @returns Promise resolving to the metadata after streaming completes
   */
  async answerStream(
    request: AnswerRequest,
    onChunk: (accumulatedText: string) => void
  ): Promise<AnswerResponse | null> {
    if (!request.message || request.message.trim().length === 0) {
      throw new Error("Message is required");
    }

    const payload: AnswerRequest = {
      ...request,
      model: (request.model || this.defaultModel) as
        | "gpt-4"
        | "gpt-4-turbo"
        | "gpt-3.5-turbo",
    };

    const url = `${this.baseUrl}/answer/stream`;
    const response = await this.fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      },
      this.timeout
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    // Process the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedText = "";
    let metadata: AnswerResponse | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Check if we have metadata (indicated by two newlines)
        const metadataIndex = buffer.indexOf("\n\n{");
        if (metadataIndex !== -1) {
          // Extract text content before metadata
          const textContent = buffer.substring(0, metadataIndex);
          if (textContent) {
            accumulatedText += textContent;
            onChunk(accumulatedText);
          }

          // Extract and parse metadata
          const metadataStr = buffer.substring(metadataIndex + 2);
          try {
            metadata = JSON.parse(metadataStr);
          } catch (e) {
            // If metadata isn't complete yet, continue reading
            continue;
          }
          buffer = "";
          break;
        } else {
          // Accumulate and send the full text so far
          accumulatedText += buffer;
          onChunk(accumulatedText);
          buffer = "";
        }
      }

      // If there's remaining text in the buffer, send it
      if (buffer) {
        // Try to extract metadata from buffer
        const lines = buffer.split("\n\n");
        if (lines.length > 1) {
          const textPart = lines[0];
          const metadataPart = lines.slice(1).join("\n\n");

          if (textPart) {
            accumulatedText += textPart;
            onChunk(accumulatedText);
          }

          if (metadataPart) {
            try {
              metadata = JSON.parse(metadataPart);
            } catch {
              // If it's not valid JSON, treat it as text
              accumulatedText += "\n\n" + metadataPart;
              onChunk(accumulatedText);
            }
          }
        } else {
          accumulatedText += buffer;
          onChunk(accumulatedText);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return metadata;
  }

  /**
   * Generate a streaming AI response with brand enrichment (alternative API using async generator)
   * @param request - The answer request payload
   * @returns Async generator yielding accumulated text and final metadata
   */
  async *answerStreamGenerator(
    request: AnswerRequest
  ): AsyncGenerator<string | { metadata: AnswerResponse }, void, unknown> {
    if (!request.message || request.message.trim().length === 0) {
      throw new Error("Message is required");
    }

    const payload: AnswerRequest = {
      ...request,
      model: (request.model || this.defaultModel) as
        | "gpt-4"
        | "gpt-4-turbo"
        | "gpt-3.5-turbo",
    };

    const url = `${this.baseUrl}/answer/stream`;
    const response = await this.fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      },
      this.timeout
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    // Process the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Check if we have metadata (indicated by two newlines)
        const metadataIndex = buffer.indexOf("\n\n{");
        if (metadataIndex !== -1) {
          // Extract text content before metadata
          const textContent = buffer.substring(0, metadataIndex);
          if (textContent) {
            accumulatedText += textContent;
            yield accumulatedText;
          }

          // Extract and parse metadata
          const metadataStr = buffer.substring(metadataIndex + 2);
          let metadata: AnswerResponse;
          try {
            metadata = JSON.parse(metadataStr);
            yield { metadata };
            buffer = "";
            break;
          } catch (e) {
            // If metadata isn't complete yet, continue reading
            continue;
          }
        } else {
          // Yield accumulated text so far
          accumulatedText += buffer;
          yield accumulatedText;
          buffer = "";
        }
      }

      // If there's remaining text in the buffer, yield it
      if (buffer) {
        // Try to extract metadata from buffer
        const lines = buffer.split("\n\n");
        if (lines.length > 1) {
          const textPart = lines[0];
          const metadataPart = lines.slice(1).join("\n\n");

          if (textPart) {
            accumulatedText += textPart;
            yield accumulatedText;
          }

          if (metadataPart) {
            try {
              const metadata = JSON.parse(metadataPart);
              yield { metadata };
            } catch {
              // If it's not valid JSON, treat it as text
              accumulatedText += "\n\n" + metadataPart;
              yield accumulatedText;
            }
          }
        } else {
          accumulatedText += buffer;
          yield accumulatedText;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
