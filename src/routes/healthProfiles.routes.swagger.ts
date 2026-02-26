/**
 * @swagger
 * components:
 *   schemas:
 *     HealthProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         bloodType:
 *           type: string
 *         height:
 *           type: number
 *         weight:
 *           type: number
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *         chronicConditions:
 *           type: array
 *           items:
 *             type: string
 *         medications:
 *           type: array
 *           items:
 *             type: string
 *         preferences:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *
 *     HealthProfileCreate:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         bloodType:
 *           type: string
 *         height:
 *           type: number
 *         weight:
 *           type: number
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *         chronicConditions:
 *           type: array
 *           items:
 *             type: string
 *         medications:
 *           type: array
 *           items:
 *             type: string
 *         preferences:
 *           type: object
 *
 *     HealthProfileUpdate:
 *       type: object
 *       properties:
 *         bloodType:
 *           type: string
 *         height:
 *           type: number
 *         weight:
 *           type: number
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *         chronicConditions:
 *           type: array
 *           items:
 *             type: string
 *         medications:
 *           type: array
 *           items:
 *             type: string
 *         preferences:
 *           type: object
 */

/**
 * @swagger
 * /api/v1/health-profiles/me:
 *   get:
 *     summary: Get current user's health profile
 *     tags: [Health Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health profile details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HealthProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Health profile not found
 */

/**
 * @swagger
 * /api/v1/health-profiles/{userId}:
 *   get:
 *     summary: Get health profile by user ID
 *     tags: [Health Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Health profile details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (family members only)
 *       404:
 *         description: Health profile not found
 */

/**
 * @swagger
 * /api/v1/health-profiles:
 *   post:
 *     summary: Create health profile
 *     tags: [Health Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthProfileCreate'
 *     responses:
 *       201:
 *         description: Health profile created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (self or family members only)
 */

/**
 * @swagger
 * /api/v1/health-profiles/{id}:
 *   put:
 *     summary: Update health profile
 *     tags: [Health Profiles]
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
 *             $ref: '#/components/schemas/HealthProfileUpdate'
 *     responses:
 *       200:
 *         description: Health profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (self or family members only)
 *       404:
 *         description: Health profile not found
 */

