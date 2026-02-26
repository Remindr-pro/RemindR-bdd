import { Router } from 'express';
import prisma from '../config/database';
import { cache } from '../middleware/cache';

const router = Router();

router.get('/', cache({ ttl: 300 }), async (_req, res, next) => {
  try {
    const types = await prisma.reminderType.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
