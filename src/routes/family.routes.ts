import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const familyController = new FamilyController();

router.use(authenticate as any);

router.get('/me', familyController.getMyFamily as any);
router.get('/:id', familyController.getById as any);
router.put('/:id', familyController.update as any);

export default router;

