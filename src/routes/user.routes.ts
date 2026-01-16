import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { authorizeUserType } from '../middleware/userTypeAuth';
import { UserType } from '@prisma/client';

const router = Router();
const userController = new UserController();

router.get('/', authenticate as any, (req, res, next) => authorizeUserType(UserType.ADMIN, UserType.PROFESSIONAL)(req as any, res, next), userController.getAll as any);
router.get('/:id', authenticate as any, userController.getById as any);
router.put('/:id', authenticate as any, userController.update as any);
router.delete('/:id', authenticate as any, authorize('admin') as any, (req, res, next) => authorizeUserType(UserType.ADMIN)(req as any, res, next), userController.delete as any);

export default router;

