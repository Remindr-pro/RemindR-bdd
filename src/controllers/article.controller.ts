import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { invalidateCache } from '../middleware/cache';
import { webhookService } from '../services/webhook.service';
import { Prisma } from '@prisma/client';

export class ArticleController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId, published } = req.query;

      const where: { categoryId?: string; isPublished?: boolean } = {};
      if (categoryId) {
        const categoryIdStr = Array.isArray(categoryId) ? categoryId[0] : typeof categoryId === 'string' ? categoryId : undefined;
        if (categoryIdStr && typeof categoryIdStr === 'string') where.categoryId = categoryIdStr;
      }
      if (published !== undefined) where.isPublished = published === 'true';

      const articles = await prisma.article.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: articles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const article = await prisma.article.findUnique({
        where: { id: idStr },
        include: {
          category: true,
        },
      });

      if (!article) {
        res.status(404).json({
          success: false,
          message: 'Article not found',
        });
        return;
      }

      res.json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const categoryIdStr = Array.isArray(categoryId) ? categoryId[0] : categoryId;

      const articles = await prisma.article.findMany({
        where: {
          categoryId: categoryIdStr,
          isPublished: true,
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: articles,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId, title, content, excerpt, coverImageUrl, readingTimeMinutes, author, targetAudience, seoKeywords } = req.body;

      const article = await prisma.article.create({
        data: {
          categoryId,
          title,
          content,
          excerpt,
          coverImageUrl,
          readingTimeMinutes,
          author,
          targetAudience: targetAudience || {},
          seoKeywords: seoKeywords || [],
        },
        include: {
          category: true,
        },
      });

      await invalidateCache('articles');
      await webhookService.triggerWebhook('article.created', {
        articleId: article.id,
        title: article.title,
      });

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const { categoryId, title, content, excerpt, coverImageUrl, readingTimeMinutes, author, targetAudience, seoKeywords, isPublished } = req.body;

      const updateData: Prisma.ArticleUpdateInput = {};
      if (categoryId) {
        updateData.category = {
          connect: { id: typeof categoryId === 'string' ? categoryId : String(categoryId) },
        };
      }
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
      if (readingTimeMinutes) updateData.readingTimeMinutes = readingTimeMinutes;
      if (author !== undefined) updateData.author = author;
      if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
      if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
      if (isPublished !== undefined) {
        updateData.isPublished = isPublished;
        if (isPublished) updateData.publishedAt = new Date();
      }

      const article = await prisma.article.update({
        where: { id: idStr },
        data: updateData,
        include: {
          category: true,
        },
      });

      await invalidateCache('articles');

      res.json({
        success: true,
        message: 'Article updated successfully',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      await prisma.article.delete({
        where: { id: idStr },
      });

      await invalidateCache('articles');

      res.json({
        success: true,
        message: 'Article deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const article = await prisma.article.update({
        where: { id: idStr },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      await invalidateCache('articles');
      await webhookService.triggerWebhook('article.published', {
        articleId: article.id,
        title: article.title,
      });

      res.json({
        success: true,
        message: 'Article published successfully',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }
}

