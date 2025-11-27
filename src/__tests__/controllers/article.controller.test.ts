import { Request, Response, NextFunction } from 'express';
import { ArticleController } from '../../controllers/article.controller';
import prisma from '../../config/database';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    article: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ArticleController', () => {
  let controller: ArticleController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    controller = new ArticleController();
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all articles', async () => {
      const mockArticles = [
        {
          id: '1',
          title: 'Test Article',
          isPublished: true,
          category: { name: 'Health' },
        },
      ];

      (prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles);

      await controller.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.article.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockArticles,
      });
    });

    it('should filter by published status', async () => {
      mockRequest.query = { published: 'true' };

      await controller.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by category', async () => {
      mockRequest.query = { categoryId: 'cat-123' };

      await controller.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat-123' },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getById', () => {
    it('should return article by id', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Test Article',
        content: 'Content here',
        category: { name: 'Health' },
      };

      mockRequest.params = { id: 'article-123' };
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);

      await controller.getById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockArticle,
      });
    });

    it('should return 404 if article not found', async () => {
      mockRequest.params = { id: 'not-found' };
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      await controller.getById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('should create an article', async () => {
      const articleData = {
        categoryId: 'cat-123',
        title: 'New Article',
        content: 'Article content',
        excerpt: 'Short excerpt',
      };

      mockRequest.body = articleData;

      const mockCreated = {
        id: 'article-123',
        ...articleData,
        category: { name: 'Health' },
      };

      (prisma.article.create as jest.Mock).mockResolvedValue(mockCreated);

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.article.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('publish', () => {
    it('should publish an article', async () => {
      mockRequest.params = { id: 'article-123' };

      const mockPublished = {
        id: 'article-123',
        isPublished: true,
        publishedAt: new Date(),
      };

      (prisma.article.update as jest.Mock).mockResolvedValue(mockPublished);

      await controller.publish(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(prisma.article.update).toHaveBeenCalledWith({
        where: { id: 'article-123' },
        data: {
          isPublished: true,
          publishedAt: expect.any(Date),
        },
      });
    });
  });
});

