import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const recommendationController = new RecommendationController();

router.use(authenticate as any);

router.get('/', recommendationController.getAll as any);
router.get('/:id', recommendationController.getById as any);
router.post('/:id/dismiss', recommendationController.dismiss as any);
router.post('/:id/click', recommendationController.recordClick as any);

export default router;

