import { z } from 'zod';

export const createHealthProfileSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    bloodType: z.string().optional(),
    height: z.number().positive().optional(),
    heightMeasuredAt: z.string().datetime().optional(),
    weight: z.number().positive().optional(),
    weightMeasuredAt: z.string().datetime().optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    preferences: z.record(z.string(), z.any()).optional(),
  }),
});

export const updateHealthProfileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid health profile ID'),
  }),
  body: z.object({
    bloodType: z.string().optional(),
    height: z.number().positive().optional(),
    heightMeasuredAt: z.string().datetime().optional(),
    weight: z.number().positive().optional(),
    weightMeasuredAt: z.string().datetime().optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    preferences: z.record(z.string(), z.any()).optional(),
  }),
});

