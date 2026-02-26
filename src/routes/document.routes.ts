import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const documentController = new DocumentController();

router.use(authenticate as any);

router.get('/', documentController.getAll as any);
router.post('/', documentController.create as any);
router.post('/:id/send-to-mutuelle', documentController.sendToMutuelle as any);

export default router;
