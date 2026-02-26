import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate as any, authController.logout as any);
router.get('/me', authenticate as any, authController.getMe as any);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/apple', authController.appleAuth);
router.get('/apple/callback', authController.appleCallback);

export default router;

