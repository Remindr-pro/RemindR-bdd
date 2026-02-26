/**
 * @swagger
 * components:
 *   schemas:
 *     Recommendation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         recommendationType:
 *           type: string
 *         articleId:
 *           type: string
 *           format: uuid
 *         partnerId:
 *           type: string
 *           format: uuid
 *         priority:
 *           type: integer
 *         isDismissed:
 *           type: boolean
 *         dismissedAt:
 *           type: string
 *           format: date-time
 *         clickedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         article:
 *           type: object
 *         partner:
 *           type: object
 */

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: Get all recommendations for current user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommendations
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
 *                     $ref: '#/components/schemas/Recommendation'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/recommendations/{id}:
 *   get:
 *     summary: Get recommendation by ID
 *     tags: [Recommendations]
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
 *         description: Recommendation details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recommendation not found
 */

/**
 * @swagger
 * /api/v1/recommendations/{id}/dismiss:
 *   post:
 *     summary: Dismiss a recommendation
 *     tags: [Recommendations]
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
 *         description: Recommendation dismissed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recommendation not found
 */

/**
 * @swagger
 * /api/v1/recommendations/{id}/click:
 *   post:
 *     summary: Record a click on a recommendation
 *     tags: [Recommendations]
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
 *         description: Click recorded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recommendation not found
 */

