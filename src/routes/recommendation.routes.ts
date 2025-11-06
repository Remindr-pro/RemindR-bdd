import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const recommendationController = new RecommendationController();

router.use(authenticate);

router.get('/', recommendationController.getAll);
router.get('/:id', recommendationController.getById);
router.post('/:id/dismiss', recommendationController.dismiss);
router.post('/:id/click', recommendationController.recordClick);

export default router;

