import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { startReminderScheduler } from './jobs/reminderScheduler';
import './services/queue.processors';

process.on('unhandledRejection', (reason, promise) => {
  if (reason && typeof reason === 'object' && 'code' in reason) {
    if (reason.code === 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      return;
    }
  }
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);
app.use(rateLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(`/api/${API_VERSION}`, routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV !== 'test') {
    startReminderScheduler();
  }
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log(`💡 Try one of these solutions:`);
    console.log(`   1. Stop the other process using port ${PORT}`);
    console.log(`   2. Use a different port: PORT=3001 npm run dev:no-redis`);
    console.log(`   3. Find and kill the process: netstat -ano | findstr :${PORT}`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

export default app;

