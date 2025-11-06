export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
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

