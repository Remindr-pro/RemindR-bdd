import { Router } from 'express';
import { QuestionnaryController } from '../controllers/questionnary.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const questionnaryController = new QuestionnaryController();

router.use(authenticate as any);

router.get('/me', questionnaryController.getMyQuestionnary as any);
router.post('/', questionnaryController.create as any);
router.put('/:id', questionnaryController.update as any);

export default router;

