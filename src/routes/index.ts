import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import reminderRoutes from './reminder.routes';
import reminderTypeRoutes from './reminderType.routes';
import healthProfileRoutes from './healthProfile.routes';
import articleRoutes from './article.routes';
import articleCategoryRoutes from './articleCategory.routes';
import recommendationRoutes from './recommendation.routes';
import notificationRoutes from './notification.routes';
import questionnaryRoutes from './questionnary.routes';
import familyRoutes from './family.routes';
import webhookRoutes from './webhook.routes';
import partnerRoutes from './partner.routes';
import analyticsRoutes from './analytics.routes';
import documentRoutes from './document.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/partners', partnerRoutes);
router.use('/users', userRoutes);
router.use('/reminders', reminderRoutes);
router.use('/reminder-types', reminderTypeRoutes);
router.use('/article-categories', articleCategoryRoutes);
router.use('/health-profiles', healthProfileRoutes);
router.use('/articles', articleRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/questionnary', questionnaryRoutes);
router.use('/families', familyRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/documents', documentRoutes);

export default router;
