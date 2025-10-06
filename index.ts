/**
 * Thred API TypeScript SDK
 *
 * A comprehensive TypeScript SDK for the Thred API that provides
 * AI response generation with brand enrichment.
 *
 * @packageDocumentation
 */

export { ThredClient } from "./client";

export type {
  ThredConfig,
  AnswerRequest,
  AnswerRequestOptions,
  AnswerResponse,
  BrandInfo,
  Targets,
  AnswerMetadata,
  ErrorResponse,
  StreamingResponse,
} from "./types";

export {
  ThredError,
  AuthenticationError,
  ValidationError,
  ServerError,
  NetworkError,
  TimeoutError,
} from "./errors";
