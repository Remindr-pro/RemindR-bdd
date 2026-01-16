import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initSentry, captureException } from './config/sentry';
import { expressErrorHandler } from '@sentry/node';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { startReminderScheduler } from './jobs/reminderScheduler';
import { setupGracefulShutdown, setServer } from './utils/gracefulShutdown';
import { healthCheck } from './controllers/health.controller';
import { metrics } from './controllers/metrics.controller';
import { logger } from './config/logger';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import './services/queue.processors';

dotenv.config();

initSentry();
setupGracefulShutdown();

process.on('unhandledRejection', (reason, promise) => {
  if (reason && typeof reason === 'object' && 'code' in reason) {
    if (reason.code === 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      return;
    }
  }
  logger.error({ promise, reason }, 'Unhandled Rejection');
  captureException(reason, { contexts: { promise: { promise } } });
});

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

if (process.env.NODE_ENV === 'production' && (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.includes('localhost'))) {
  logger.warn('CORS_ORIGIN should be configured for production domains, not localhost!');
}

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const passport = require('./config/passport').default;
app.use(passport.initialize());

app.use(requestId);
app.use(requestLogger);
app.use(rateLimiter);

app.get('/health', healthCheck);
app.get('/metrics', metrics);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RemindR API Documentation',
}));

app.use(`/api/${API_VERSION}`, routes);

app.use(expressErrorHandler());

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

let server: any = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info({
      port: PORT,
      apiVersion: API_VERSION,
      environment: process.env.NODE_ENV,
    }, 'Server started');
    
    setServer(server);
    startReminderScheduler();
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error({ port: PORT, code: error.code }, 'Port already in use');
      process.exit(1);
    } else {
      logger.error({ error }, 'Server error');
      process.exit(1);
    }
  });
}

export default app;

