import jwt from 'jsonwebtoken';
import { oauth2Config } from '../config/jwt';

export interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

export const generateAppleClientSecret = (): string => {
  if (!oauth2Config.apple.clientSecret) {
    throw new Error('Apple client secret not configured');
  }

  const teamId = process.env.APPLE_TEAM_ID || '';
  const keyId = process.env.APPLE_KEY_ID || '';
  const privateKey = oauth2Config.apple.clientSecret.replace(/\\n/g, '\n');

  const token = jwt.sign(
    {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      aud: 'https://appleid.apple.com',
      sub: oauth2Config.apple.clientId,
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId,
    }
  );

  return token;
};

export const getAppleUserInfo = async (code: string): Promise<any> => {
  const clientSecret = generateAppleClientSecret();

  const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: oauth2Config.apple.clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: oauth2Config.apple.redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange Apple authorization code');
  }

  const tokens = await tokenResponse.json() as AppleTokenResponse;
  const decoded = jwt.decode(tokens.id_token) as any;

  return {
    email: decoded.email,
    sub: decoded.sub,
    email_verified: decoded.email_verified,
  };
};

