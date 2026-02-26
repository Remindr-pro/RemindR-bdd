import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const reminderController = new ReminderController();

router.use(authenticate as any);

router.get('/calendar', reminderController.getCalendar as any);
router.get('/', reminderController.getAll as any);
router.get('/:id', reminderController.getById as any);
router.post('/', reminderController.create as any);
router.put('/:id', reminderController.update as any);
router.delete('/:id', reminderController.delete as any);
router.patch('/:id/toggle', reminderController.toggleActive as any);

export default router;

