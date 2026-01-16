import { logger } from './logger';

const defaultJwtSecret = 'your-secret-key';
const defaultRefreshSecret = 'your-refresh-secret-key';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === defaultJwtSecret) {
    logger.fatal('JWT_SECRET must be set to a secure value in production!');
    process.exit(1);
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === defaultRefreshSecret) {
    logger.fatal('JWT_REFRESH_SECRET must be set to a secure value in production!');
    process.exit(1);
  }
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET || defaultJwtSecret,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || defaultRefreshSecret,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

export const oauth2Config = {
  google: {
    clientId: process.env.OAUTH2_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.OAUTH2_GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.OAUTH2_GOOGLE_REDIRECT_URI || '',
  },
  apple: {
    clientId: process.env.OAUTH2_APPLE_CLIENT_ID || '',
    clientSecret: process.env.OAUTH2_APPLE_CLIENT_SECRET || '',
    redirectUri: process.env.OAUTH2_APPLE_REDIRECT_URI || '',
  },
};
