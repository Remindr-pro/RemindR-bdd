import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate);

router.get('/', notificationController.getAll);
router.get('/:id', notificationController.getById);
router.patch('/:id/read', notificationController.markAsRead);

export default router;

