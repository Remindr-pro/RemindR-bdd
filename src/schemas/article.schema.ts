import { z } from 'zod';

export const createArticleSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().optional(),
    coverImageUrl: z.string().url().optional(),
    readingTimeMinutes: z.number().int().positive().optional(),
    author: z.string().optional(),
    targetAudience: z.record(z.string(), z.any()).optional(),
    seoKeywords: z.array(z.string()).optional(),
  }),
});

export const updateArticleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid article ID'),
  }),
  body: z.object({
    categoryId: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    coverImageUrl: z.string().url().optional(),
    readingTimeMinutes: z.number().int().positive().optional(),
    author: z.string().optional(),
    targetAudience: z.record(z.string(), z.any()).optional(),
    seoKeywords: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});

