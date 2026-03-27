import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log full error server-side — never expose internals to the client
  if (err instanceof Error) {
    console.error('[errorHandler]', err.message);
    console.error(err.stack);
    // Log OpenAI-specific error details if present
    const anyErr = err as any;
    if (anyErr.status) console.error('[OpenAI] status:', anyErr.status);
    if (anyErr.code) console.error('[OpenAI] code:', anyErr.code);
    if (anyErr.error) console.error('[OpenAI] error body:', JSON.stringify(anyErr.error));
  } else {
    console.error('Unknown error:', err);
  }

  res.status(500).json({ error: 'Unable to process your request. Please try again.' });
}
