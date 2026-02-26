import { z } from 'zod';
import { UserType } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').transform((val) => val.trim().toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').transform((val) => val.trim()),
    lastName: z.string().min(1, 'Last name is required').transform((val) => val.trim()),
    phoneNumber: z.string().transform((val) => val?.trim() || undefined).optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    genderBirth: z.string().transform((val) => val?.trim() || undefined).optional(),
    genderActual: z.string().transform((val) => val?.trim() || undefined).optional(),
    familyId: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().uuid('Invalid family ID format').optional()),
    userType: z.nativeEnum(UserType).optional().default(UserType.INDIVIDUAL),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

