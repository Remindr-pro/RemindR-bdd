import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const familyController = new FamilyController();

router.use(authenticate);

router.get('/me', familyController.getMyFamily);
router.get('/:id', familyController.getById);
router.put('/:id', familyController.update);

export default router;

