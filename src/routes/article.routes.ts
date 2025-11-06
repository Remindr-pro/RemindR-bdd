import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const articleController = new ArticleController();

router.get('/', articleController.getAll);
router.get('/:id', articleController.getById);
router.get('/category/:categoryId', articleController.getByCategory);

router.use(authenticate);
router.use(authorize('admin', 'editor'));

router.post('/', articleController.create);
router.put('/:id', articleController.update);
router.delete('/:id', articleController.delete);
router.patch('/:id/publish', articleController.publish);

export default router;

