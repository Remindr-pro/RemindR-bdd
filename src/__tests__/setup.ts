import dotenv from 'dotenv';

const originalError = console.error;
const originalWarn = console.warn;

console.error = jest.fn((...args) => {
  const message = args.join(' ').toString();
  if (
    message.includes('Firebase Service Account') ||
    message.includes('Redis connection error') ||
    message.includes('FCM not configured') ||
    message.includes('SendGrid not configured') ||
    message.includes('Twilio not configured') ||
    message.includes('Please check that FCM_SERVICE_ACCOUNT_PATH') ||
    (message.includes('Push notification error') && message.includes('FCM error'))
  ) {
    return;
  }
  originalError(...args);
});

console.warn = jest.fn((...args) => {
  const message = args.join(' ').toString();
  if (
    message.includes('FCM') ||
    message.includes('SendGrid not configured') ||
    message.includes('Twilio not configured') ||
    message.includes('Using FCM_SERVER_KEY') ||
    message.includes('Firebase Cloud Messaging') ||
    message.includes('Set FCM_SERVICE_ACCOUNT_PATH') ||
    message.includes('Set FCM_SERVER_KEY')
  ) {
    return;
  }
  originalWarn(...args);
});

jest.mock('firebase-admin', () => {
  const mockMessaging = jest.fn(() => ({
    send: jest.fn().mockResolvedValue({}),
  }));
  
  return {
    __esModule: true,
    default: {
      apps: [],
      messaging: mockMessaging,
      initializeApp: jest.fn(),
      credential: {
        cert: jest.fn(),
      },
    },
  };
});

dotenv.config({ path: '.env.test' });
dotenv.config();

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://remindr:remindr_password@localhost:5432/remindr_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
delete process.env.FCM_SERVICE_ACCOUNT_PATH;
delete process.env.FCM_SERVER_KEY;
delete process.env.FCM_PROJECT_ID;

jest.mock('../config/redis', () => {
  const Redis = require('ioredis');
  const mockRedis = new Redis({
    host: 'localhost',
    port: 6379,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
  mockRedis.connect = jest.fn().mockResolvedValue(undefined);
  mockRedis.disconnect = jest.fn().mockResolvedValue(undefined);
  mockRedis.quit = jest.fn().mockResolvedValue(undefined);
  return {
    __esModule: true,
    default: mockRedis,
  };
});

jest.mock('../services/queue.service', () => {
  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
    process: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
  };
  return {
    __esModule: true,
    notificationQueue: mockQueue,
    reminderQueue: mockQueue,
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

