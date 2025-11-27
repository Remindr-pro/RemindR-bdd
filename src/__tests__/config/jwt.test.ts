import { jwtConfig, oauth2Config } from '../../config/jwt';

describe('JWT Configuration', () => {
  describe('jwtConfig', () => {
    it('should have secret configured', () => {
      expect(jwtConfig.secret).toBeDefined();
      expect(typeof jwtConfig.secret).toBe('string');
    });

    it('should have expiresIn configured', () => {
      expect(jwtConfig.expiresIn).toBeDefined();
      expect(typeof jwtConfig.expiresIn).toBe('string');
    });

    it('should have refreshSecret configured', () => {
      expect(jwtConfig.refreshSecret).toBeDefined();
      expect(typeof jwtConfig.refreshSecret).toBe('string');
    });

    it('should have refreshExpiresIn configured', () => {
      expect(jwtConfig.refreshExpiresIn).toBeDefined();
      expect(typeof jwtConfig.refreshExpiresIn).toBe('string');
    });
  });

  describe('oauth2Config', () => {
    it('should have Google configuration', () => {
      expect(oauth2Config.google).toBeDefined();
      expect(oauth2Config.google).toHaveProperty('clientId');
      expect(oauth2Config.google).toHaveProperty('clientSecret');
      expect(oauth2Config.google).toHaveProperty('redirectUri');
    });

    it('should have Apple configuration', () => {
      expect(oauth2Config.apple).toBeDefined();
      expect(oauth2Config.apple).toHaveProperty('clientId');
      expect(oauth2Config.apple).toHaveProperty('clientSecret');
      expect(oauth2Config.apple).toHaveProperty('redirectUri');
    });
  });
});

