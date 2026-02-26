import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class DocumentController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const where = req.user.familyId
        ? { OR: [{ userId: req.user.id }, { familyId: req.user.familyId }] }
        : { userId: req.user.id };

      const documents = await prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { documentType, fileName, fileUrl, mimeType, insuranceCompanyId } = req.body;

      if (!documentType || !fileName || !fileUrl) {
        res.status(400).json({
          success: false,
          message: 'documentType, fileName and fileUrl are required',
        });
        return;
      }

      const document = await prisma.document.create({
        data: {
          userId: req.user.id,
          familyId: req.user.familyId,
          documentType,
          fileName,
          fileUrl,
          mimeType: mimeType || null,
          insuranceCompanyId: insuranceCompanyId || null,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Document created successfully',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendToMutuelle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const { insuranceCompanyId } = req.body;

      const document = await prisma.document.findUnique({
        where: { id: idStr },
      });

      if (!document) {
        res.status(404).json({
          success: false,
          message: 'Document not found',
        });
        return;
      }

      if (document.userId !== req.user.id && document.familyId !== req.user.familyId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: you can only send your own documents or family documents',
        });
        return;
      }

      const companyId = insuranceCompanyId || document.insuranceCompanyId;
      if (!companyId) {
        res.status(400).json({
          success: false,
          message: 'insuranceCompanyId is required (in body or document)',
        });
        return;
      }

      const updated = await prisma.document.update({
        where: { id: idStr },
        data: {
          sentToMutuelle: true,
          sentAt: new Date(),
          insuranceCompanyId: companyId,
        },
      });

      res.json({
        success: true,
        message: 'Document sent to mutuelle successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
