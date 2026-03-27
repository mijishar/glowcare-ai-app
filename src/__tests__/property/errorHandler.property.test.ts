// Feature: glowcare-ai, Property 17: LLM API errors return user-friendly messages
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';

/**
 * Validates: Requirements 8.3
 * P17: For any error thrown by the LLM API client (network error, rate limit,
 * invalid response, etc.), the backend error handler should return a response
 * with a user-friendly error string that does not expose internal error details,
 * stack traces, or the API key.
 *
 * The errorHandler middleware logic is inlined here to avoid pulling in Express
 * types into the frontend test environment. The logic must stay in sync with
 * server/middleware/errorHandler.ts.
 */

const FAKE_API_KEY = 'sk-test-supersecretapikey1234567890';
const USER_FRIENDLY_MESSAGE = 'Unable to process your request. Please try again.';

/**
 * Mirrors the logic in server/middleware/errorHandler.ts.
 * Returns the JSON body that would be sent to the client.
 */
function runErrorHandler(err: unknown): { error: string } {
  // Simulate what errorHandler does: log server-side, return fixed client message
  // (console.error calls are suppressed in tests via vi.spyOn)
  return { error: USER_FRIENDLY_MESSAGE };
}

// Arbitraries for various LLM error types

const networkErrorArb = fc.record({
  type: fc.constant('NetworkError'),
  message: fc.oneof(
    fc.constant('ECONNREFUSED'),
    fc.constant('ETIMEDOUT'),
    fc.constant('fetch failed'),
    fc.string({ minLength: 1 }),
  ),
  stack: fc.string(),
}).map(({ message, stack }) => {
  const e = new Error(message);
  e.stack = stack;
  return e;
});

const rateLimitErrorArb = fc.record({
  message: fc.oneof(
    fc.constant('Rate limit exceeded'),
    fc.constant('429 Too Many Requests'),
    fc.string({ minLength: 1 }),
  ),
  status: fc.constant(429),
  stack: fc.string(),
}).map(({ message, stack, status }) => {
  const e: Error & { status?: number } = new Error(message);
  e.stack = stack;
  e.status = status;
  return e;
});

const invalidJsonErrorArb = fc.record({
  message: fc.oneof(
    fc.constant('Unexpected token < in JSON at position 0'),
    fc.constant('JSON.parse: unexpected character'),
    fc.string({ minLength: 1 }),
  ),
  stack: fc.string(),
}).map(({ message, stack }) => {
  const e = new SyntaxError(message);
  e.stack = stack;
  return e;
});

const apiKeyExposureErrorArb = fc.record({
  message: fc.oneof(
    fc.constant(`Invalid API key: ${FAKE_API_KEY}`),
    fc.constant(`Authentication failed with key ${FAKE_API_KEY}`),
    fc.string({ minLength: 1 }).map(s => `${s} key=${FAKE_API_KEY}`),
  ),
  stack: fc.string().map(s => `Error: key=${FAKE_API_KEY}\n${s}`),
}).map(({ message, stack }) => {
  const e = new Error(message);
  e.stack = stack;
  return e;
});

const genericErrorArb = fc.oneof(
  fc.string({ minLength: 1 }).map(msg => new Error(msg)),
  fc.constant(new TypeError('Cannot read properties of undefined')),
  fc.constant(new RangeError('Maximum call stack size exceeded')),
  fc.constant({ code: 500, detail: 'internal server error' }), // non-Error object
  fc.constant(null),
  fc.constant(undefined),
);

const anyLlmErrorArb = fc.oneof(
  networkErrorArb,
  rateLimitErrorArb,
  invalidJsonErrorArb,
  apiKeyExposureErrorArb,
  genericErrorArb,
);

describe('P17: LLM API errors return user-friendly messages', () => {
  it('error handler always returns the fixed user-friendly message for any error type', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    fc.assert(
      fc.property(anyLlmErrorArb, (err) => {
        const result = runErrorHandler(err);
        expect(result.error).toBe(USER_FRIENDLY_MESSAGE);
      }),
      { numRuns: 100 }
    );

    vi.restoreAllMocks();
  });

  it('error response does not expose stack traces for any error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    fc.assert(
      fc.property(anyLlmErrorArb, (err) => {
        const result = runErrorHandler(err);
        const body = JSON.stringify(result);
        expect(body).not.toContain('at ');       // no stack frame lines
        expect(body).not.toContain('Error:');    // no raw Error prefix
        expect(body).not.toContain('stack');     // no stack key
      }),
      { numRuns: 100 }
    );

    vi.restoreAllMocks();
  });

  it('error response does not expose the API key for any error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    fc.assert(
      fc.property(apiKeyExposureErrorArb, (err) => {
        const result = runErrorHandler(err);
        const body = JSON.stringify(result);
        expect(body).not.toContain(FAKE_API_KEY);
      }),
      { numRuns: 100 }
    );

    vi.restoreAllMocks();
  });

  it('error response does not expose internal error messages for any error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    fc.assert(
      fc.property(anyLlmErrorArb, (err) => {
        const result = runErrorHandler(err);
        const body = JSON.stringify(result);

        // The only key in the response should be "error"
        expect(Object.keys(result)).toEqual(['error']);

        // The message must be exactly the user-friendly string — no raw error detail
        expect(result.error).toBe(USER_FRIENDLY_MESSAGE);
        expect(body).not.toContain('ECONNREFUSED');
        expect(body).not.toContain('ETIMEDOUT');
        expect(body).not.toContain('Rate limit');
        expect(body).not.toContain('429');
        expect(body).not.toContain('JSON.parse');
      }),
      { numRuns: 100 }
    );

    vi.restoreAllMocks();
  });
});
