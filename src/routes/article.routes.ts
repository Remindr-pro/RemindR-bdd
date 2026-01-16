import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { authenticate, authorize } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { authorizeUserType } from '../middleware/userTypeAuth';
import { UserType } from '@prisma/client';

const router = Router();
const articleController = new ArticleController();

router.get('/', cache({ ttl: 300 }), articleController.getAll);
router.get('/:id', cache({ ttl: 600 }), articleController.getById);
router.get('/category/:categoryId', cache({ ttl: 300 }), articleController.getByCategory);

router.use(authenticate as any);
router.use(authorize('admin', 'editor') as any);
router.use((req, res, next) => authorizeUserType(UserType.ADMIN, UserType.PROFESSIONAL)(req as any, res, next));

router.post('/', articleController.create);
router.put('/:id', articleController.update);
router.delete('/:id', articleController.delete);
router.patch('/:id/publish', articleController.publish);

export default router;

