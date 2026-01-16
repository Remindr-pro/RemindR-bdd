import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate as any, authController.logout as any);
router.get('/me', authenticate as any, authController.getMe as any);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/apple', authController.appleAuth);
router.get('/apple/callback', authController.appleCallback);

export default router;

