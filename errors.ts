/**
 * Error handling utilities for Thred API
 */

import type { ErrorResponse } from './types';

/**
 * Base error class for all Thred API errors
 */
export class ThredError extends Error {
  public readonly statusCode?: number;
  public readonly response?: ErrorResponse;

  constructor(message: string, statusCode?: number, response?: ErrorResponse) {
    super(message);
    this.name = 'ThredError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, ThredError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends ThredError {
  constructor(message: string = 'Authentication failed', response?: ErrorResponse) {
    super(message, 401, response);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends ThredError {
  constructor(message: string = 'Validation failed', response?: ErrorResponse) {
    super(message, 400, response);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when the API returns a server error
 */
export class ServerError extends ThredError {
  constructor(message: string = 'Internal server error', response?: ErrorResponse) {
    super(message, 500, response);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Error thrown when a network request fails
 */
export class NetworkError extends ThredError {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when a request times out
 */
export class TimeoutError extends ThredError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Handle API errors and throw appropriate error types
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorData: ErrorResponse | undefined;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    }
  } catch {
    // If we can't parse the error response, continue without it
  }

  const message = errorData?.message || errorData?.error || response.statusText;

  switch (response.status) {
    case 400:
      throw new ValidationError(message, errorData);
    case 401:
      throw new AuthenticationError(message, errorData);
    case 500:
      throw new ServerError(message, errorData);
    default:
      throw new ThredError(message, response.status, errorData);
  }
}

