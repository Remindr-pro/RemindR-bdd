import { Router } from 'express';
import { HealthProfileController } from '../controllers/healthProfile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const healthProfileController = new HealthProfileController();

router.use(authenticate as any);

router.get('/me', healthProfileController.getMyProfile as any);
router.get('/:userId', healthProfileController.getByUserId as any);
router.post('/', healthProfileController.create as any);
router.put('/:id', healthProfileController.update as any);

export default router;

