/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         categoryId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         excerpt:
 *           type: string
 *         coverImageUrl:
 *           type: string
 *         readingTimeMinutes:
 *           type: integer
 *         author:
 *           type: string
 *         isPublished:
 *           type: boolean
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         targetAudience:
 *           type: object
 *         seoKeywords:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ArticleCreate:
 *       type: object
 *       required:
 *         - categoryId
 *         - title
 *         - content
 *       properties:
 *         categoryId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: "10 conseils pour une meilleure santé"
 *         content:
 *           type: string
 *           example: "Contenu de l'article..."
 *         excerpt:
 *           type: string
 *           example: "Résumé de l'article"
 *         coverImageUrl:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         readingTimeMinutes:
 *           type: integer
 *           example: 5
 *         author:
 *           type: string
 *           example: "Dr. Smith"
 *         targetAudience:
 *           type: object
 *         seoKeywords:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *             example:
 *               success: true
 *               data:
 *                 - id: 123e4567-e89b-12d3-a456-426614174000
 *                   title: "10 conseils pour une meilleure santé"
 *                   excerpt: "Découvrez nos conseils..."
 *                   isPublished: true
 *
 *   post:
 *     summary: Create a new article (Admin/Professional only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleCreate'
 *           example:
 *             categoryId: 123e4567-e89b-12d3-a456-426614174000
 *             title: "10 conseils pour une meilleure santé"
 *             content: "Contenu complet de l'article..."
 *             excerpt: "Résumé de l'article"
 *             readingTimeMinutes: 5
 *     responses:
 *       201:
 *         description: Article created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin/professional)
 */

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *
 *   put:
 *     summary: Update article (Admin/Professional only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleCreate'
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Article not found
 *
 *   delete:
 *     summary: Delete article (Admin/Professional only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Article not found
 */

/**
 * @swagger
 * /api/v1/articles/category/{categoryId}:
 *   get:
 *     summary: Get articles by category
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of articles in category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /api/v1/articles/{id}/publish:
 *   patch:
 *     summary: Publish article (Admin/Professional only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Article published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Article not found
 */

