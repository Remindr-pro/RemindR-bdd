import { z } from 'zod';
import { UserType } from '@prisma/client';

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phoneNumber: z.string().optional(),
    genderActual: z.string().optional(),
    profilePictureUrl: z.string().url().optional(),
    userType: z.nativeEnum(UserType).optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

