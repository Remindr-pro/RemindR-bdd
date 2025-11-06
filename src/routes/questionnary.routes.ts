import { Router } from 'express';
import { QuestionnaryController } from '../controllers/questionnary.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const questionnaryController = new QuestionnaryController();

router.use(authenticate);

router.get('/me', questionnaryController.getMyQuestionnary);
router.post('/', questionnaryController.create);
router.put('/:id', questionnaryController.update);

export default router;

