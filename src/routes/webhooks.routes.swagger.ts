/**
 * @swagger
 * components:
 *   schemas:
 *     Webhook:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         url:
 *           type: string
 *           format: uri
 *         events:
 *           type: array
 *           items:
 *             type: string
 *         secret:
 *           type: string
 *         isActive:
 *           type: boolean
 *         lastTriggeredAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         _count:
 *           type: object
 *           properties:
 *             webhookLogs:
 *               type: integer
 *
 *     WebhookCreate:
 *       type: object
 *       required:
 *         - url
 *         - events
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           example: https://example.com/webhook
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           example: ["user.created", "user.updated"]
 *         secret:
 *           type: string
 *         isActive:
 *           type: boolean
 *           default: true
 *
 *     WebhookUpdate:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *         events:
 *           type: array
 *           items:
 *             type: string
 *         secret:
 *           type: string
 *         isActive:
 *           type: boolean
 *
 *     WebhookLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         webhookId:
 *           type: string
 *           format: uuid
 *         event:
 *           type: string
 *         payload:
 *           type: object
 *         responseStatus:
 *           type: integer
 *         responseBody:
 *           type: string
 *         error:
 *           type: string
 *         triggeredAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/webhooks:
 *   get:
 *     summary: Get all webhooks (Admin only)
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhooks
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
 *                     $ref: '#/components/schemas/Webhook'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *
 *   post:
 *     summary: Create a new webhook (Admin only)
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookCreate'
 *     responses:
 *       201:
 *         description: Webhook created successfully
 *       400:
 *         description: Invalid request (URL and events required)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */

/**
 * @swagger
 * /api/v1/webhooks/{id}:
 *   get:
 *     summary: Get webhook by ID (Admin only)
 *     tags: [Webhooks]
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
 *         description: Webhook details with logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Webhook'
 *                     - type: object
 *                       properties:
 *                         webhookLogs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/WebhookLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Webhook not found
 *
 *   put:
 *     summary: Update webhook (Admin only)
 *     tags: [Webhooks]
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
 *             $ref: '#/components/schemas/WebhookUpdate'
 *     responses:
 *       200:
 *         description: Webhook updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Webhook not found
 *
 *   delete:
 *     summary: Delete webhook (Admin only)
 *     tags: [Webhooks]
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
 *         description: Webhook deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Webhook not found
 */

/**
 * @swagger
 * /api/v1/webhooks/{id}/logs:
 *   get:
 *     summary: Get webhook logs (Admin only)
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: List of webhook logs
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
 *                     $ref: '#/components/schemas/WebhookLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */

