/**
 * @swagger
 * components:
 *   schemas:
 *     Questionnary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         step:
 *           type: integer
 *         nbPersonsFollowed:
 *           type: integer
 *         hasGeneralPractitioner:
 *           type: boolean
 *         generalPractitionerName:
 *           type: string
 *         physicalActivityFrequency:
 *           type: string
 *         dietType:
 *           type: string
 *         usesAlternativeMedicine:
 *           type: boolean
 *         alternativeMedicineTypes:
 *           type: array
 *           items:
 *             type: string
 *         lastHealthCheck:
 *           type: string
 *           format: date
 *         enabledReminderTypes:
 *           type: array
 *           items:
 *             type: string
 *         reminderFrequency:
 *           type: string
 *         enabledNotificationChannels:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     QuestionnaryCreate:
 *       type: object
 *       properties:
 *         step:
 *           type: integer
 *         nbPersonsFollowed:
 *           type: integer
 *         hasGeneralPractitioner:
 *           type: boolean
 *         generalPractitionerName:
 *           type: string
 *         physicalActivityFrequency:
 *           type: string
 *         dietType:
 *           type: string
 *         usesAlternativeMedicine:
 *           type: boolean
 *         alternativeMedicineTypes:
 *           type: array
 *           items:
 *             type: string
 *         lastHealthCheck:
 *           type: string
 *           format: date
 *         enabledReminderTypes:
 *           type: array
 *           items:
 *             type: string
 *         reminderFrequency:
 *           type: string
 *         enabledNotificationChannels:
 *           type: array
 *           items:
 *             type: string
 *
 *     QuestionnaryUpdate:
 *       type: object
 *       properties:
 *         step:
 *           type: integer
 *         nbPersonsFollowed:
 *           type: integer
 *         hasGeneralPractitioner:
 *           type: boolean
 *         generalPractitionerName:
 *           type: string
 *         physicalActivityFrequency:
 *           type: string
 *         dietType:
 *           type: string
 *         usesAlternativeMedicine:
 *           type: boolean
 *         alternativeMedicineTypes:
 *           type: array
 *           items:
 *             type: string
 *         lastHealthCheck:
 *           type: string
 *           format: date
 *         enabledReminderTypes:
 *           type: array
 *           items:
 *             type: string
 *         reminderFrequency:
 *           type: string
 *         enabledNotificationChannels:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/v1/questionnary/me:
 *   get:
 *     summary: Get current user's questionnaire
 *     tags: [Questionnaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Questionnaire details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Questionnary'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Questionnaire not found
 */

/**
 * @swagger
 * /api/v1/questionnary:
 *   post:
 *     summary: Create questionnaire
 *     tags: [Questionnaire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionnaryCreate'
 *     responses:
 *       201:
 *         description: Questionnaire created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/questionnary/{id}:
 *   put:
 *     summary: Update questionnaire
 *     tags: [Questionnaire]
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
 *             $ref: '#/components/schemas/QuestionnaryUpdate'
 *     responses:
 *       200:
 *         description: Questionnaire updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Questionnaire not found
 */

