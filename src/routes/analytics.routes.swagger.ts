/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Dashboard analytics (Admin/Professional uniquement)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs (utilisateurs, familles, rappels, recommandations, notifications)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         newLast30Days:
 *                           type: integer
 *                     families:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                     reminders:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                     recommendations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin or Professional required)
 */
