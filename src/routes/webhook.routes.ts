import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const webhookController = new WebhookController();

router.use(authenticate as any);
router.use(authorize('admin') as any);

router.get('/', (req, res, next) => webhookController.getAll(req as any, res, next));
router.get('/:id', (req, res, next) => webhookController.getById(req, res, next));
router.get('/:id/logs', (req, res, next) => webhookController.getLogs(req, res, next));
router.post('/', (req, res, next) => webhookController.create(req, res, next));
router.put('/:id', (req, res, next) => webhookController.update(req, res, next));
router.delete('/:id', (req, res, next) => webhookController.delete(req, res, next));

export default router;

