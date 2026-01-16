import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate as any);

router.get('/', notificationController.getAll as any);
router.get('/:id', notificationController.getById as any);
router.patch('/:id/read', notificationController.markAsRead as any);

export default router;

