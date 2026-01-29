/**
 * @swagger
 * components:
 *   schemas:
 *     Family:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         familyName:
 *           type: string
 *         primaryContactEmail:
 *           type: string
 *           format: email
 *         subscriptionStatus:
 *           type: string
 *         insuranceCompanyId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         insuranceCompany:
 *           type: object
 *         users:
 *           type: array
 *           items:
 *             type: object
 *
 *     FamilyUpdate:
 *       type: object
 *       properties:
 *         familyName:
 *           type: string
 *         primaryContactEmail:
 *           type: string
 *           format: email
 *         subscriptionStatus:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/families/me:
 *   get:
 *     summary: Get current user's family
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Family details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Family'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found or user not associated with a family
 */

/**
 * @swagger
 * /api/v1/families/{id}:
 *   get:
 *     summary: Get family by ID
 *     tags: [Families]
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
 *         description: Family details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found
 *
 *   put:
 *     summary: Update family
 *     tags: [Families]
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
 *             $ref: '#/components/schemas/FamilyUpdate'
 *     responses:
 *       200:
 *         description: Family updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found
 */

