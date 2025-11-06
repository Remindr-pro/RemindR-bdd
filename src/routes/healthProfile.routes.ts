import { Router } from 'express';
import { HealthProfileController } from '../controllers/healthProfile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const healthProfileController = new HealthProfileController();

router.use(authenticate);

router.get('/me', healthProfileController.getMyProfile);
router.get('/:userId', healthProfileController.getByUserId);
router.post('/', healthProfileController.create);
router.put('/:id', healthProfileController.update);

export default router;

