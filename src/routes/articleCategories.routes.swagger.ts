/**
 * @swagger
 * /api/v1/article-categories:
 *   get:
 *     summary: List all article categories
 *     tags: [Article Categories]
 *     description: Returns all article categories for filtering and creating articles
 *     responses:
 *       200:
 *         description: List of article categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: General Health
 *                       description:
 *                         type: string
 *                       targetAgeMin:
 *                         type: integer
 *                       targetAgeMax:
 *                         type: integer
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 */
