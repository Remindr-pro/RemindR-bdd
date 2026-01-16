import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { expressIntegration } from '@sentry/node';
import { logger } from './logger';

let isSentryInitialized = false;

export const initSentry = (): void => {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';
  const tracesSampleRate = environment === 'production' ? 0.1 : 1.0;
  const profilesSampleRate = environment === 'production' ? 0.1 : 1.0;

  if (!dsn) {
    if (environment === 'production') {
      logger.warn('SENTRY_DSN is not set. Sentry error tracking is disabled.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      nodeProfilingIntegration(),
      expressIntegration(),
      Sentry.httpIntegration(),
    ],
    tracesSampleRate,
    profilesSampleRate,
    beforeSend(event) {
      if (environment === 'development') {
        logger.debug({ event }, 'Sentry Event');
      }
      return event;
    },
  });

  isSentryInitialized = true;
};

export const captureException = (error: unknown, context?: Record<string, unknown>): void => {
  if (isSentryInitialized) {
    Sentry.captureException(error, context);
  }
};

export { Sentry };

