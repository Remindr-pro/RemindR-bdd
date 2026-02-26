import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { authorizeUserType } from '../middleware/userTypeAuth';
import { UserType } from '@prisma/client';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticate as any);
router.use((req, res, next) => authorizeUserType(UserType.ADMIN, UserType.PROFESSIONAL)(req as any, res, next));

router.get('/dashboard', analyticsController.getDashboard as any);

export default router;
