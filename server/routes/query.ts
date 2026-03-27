import { Router, Request, Response, NextFunction } from 'express';
import { getLLMAdvice } from '../services/llm';
import { parseLLMResponse } from '../services/parser';

const router = Router();

const MAX_INPUT_LENGTH = 1000;

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input } = req.body;

    if (input === undefined || input === null) {
      return res.status(400).json({ error: 'Missing required field: input.' });
    }

    if (typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ error: 'Input must be a non-empty string.' });
    }

    if (input.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ error: `Input must not exceed ${MAX_INPUT_LENGTH} characters.` });
    }

    const raw = await getLLMAdvice(input);
    const advice = parseLLMResponse(raw);

    return res.status(200).json(advice);
  } catch (err) {
    next(err);
  }
});

export default router;
