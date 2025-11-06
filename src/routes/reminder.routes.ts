import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const reminderController = new ReminderController();

router.use(authenticate);

router.get('/', reminderController.getAll);
router.get('/:id', reminderController.getById);
router.post('/', reminderController.create);
router.put('/:id', reminderController.update);
router.delete('/:id', reminderController.delete);
router.patch('/:id/toggle', reminderController.toggleActive);

export default router;

