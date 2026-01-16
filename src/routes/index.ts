import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import reminderRoutes from './reminder.routes';
import healthProfileRoutes from './healthProfile.routes';
import articleRoutes from './article.routes';
import recommendationRoutes from './recommendation.routes';
import notificationRoutes from './notification.routes';
import questionnaryRoutes from './questionnary.routes';
import familyRoutes from './family.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reminders', reminderRoutes);
router.use('/health-profiles', healthProfileRoutes);
router.use('/articles', articleRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/questionnary', questionnaryRoutes);
router.use('/families', familyRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
