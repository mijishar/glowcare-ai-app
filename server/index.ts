import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import queryRouter from './routes/query';

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY environment variable is not set. Please configure it before starting the server.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Timeout middleware — fires when the socket times out
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.on('timeout', () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timed out. Please try again.' });
    }
  });
  next();
});

app.use(cors());
app.use(express.json());

app.use('/api/query', queryRouter);

app.use(errorHandler);

const server = http.createServer(app);

// Enforce a 30-second request timeout
server.setTimeout(30000);

server.listen(PORT, () => {
  console.log(`GlowCare AI server running on port ${PORT}`);
});

export default app;
