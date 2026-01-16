import { Request, Response } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics({ register });

export const metrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error);
  }
};

