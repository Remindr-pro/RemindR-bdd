/**
 * @swagger
 * components:
 *   schemas:
 *     Reminder:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         typeId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         scheduledTime:
 *           type: string
 *           format: time
 *         recurrence:
 *           type: object
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         type:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *
 *     ReminderCreate:
 *       type: object
 *       required:
 *         - typeId
 *         - title
 *         - scheduledTime
 *       properties:
 *         typeId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: "Prendre médicament"
 *         description:
 *           type: string
 *         scheduledTime:
 *           type: string
 *           format: time
 *           example: "09:00:00"
 *         recurrence:
 *           type: object
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *
 *     ReminderUpdate:
 *       type: object
 *       properties:
 *         typeId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         scheduledTime:
 *           type: string
 *           format: time
 *         recurrence:
 *           type: object
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/reminders/calendar:
 *   get:
 *     summary: Calendrier familial - rappels de l'utilisateur et des membres de sa famille
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-02-01
 *         description: Date de début (ISO)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-02-28
 *         description: Date de fin (ISO)
 *     responses:
 *       200:
 *         description: Liste des rappels de la famille dans la période
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
 *                     $ref: '#/components/schemas/Reminder'
 *       400:
 *         description: Paramètres start/end manquants ou invalides
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/reminders:
 *   get:
 *     summary: Get all reminders for current user
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reminders
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
 *                     $ref: '#/components/schemas/Reminder'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReminderCreate'
 *     responses:
 *       201:
 *         description: Reminder created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/reminders/{id}:
 *   get:
 *     summary: Get reminder by ID
 *     tags: [Reminders]
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
 *         description: Reminder details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reminder not found
 *
 *   put:
 *     summary: Update reminder
 *     tags: [Reminders]
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
 *             $ref: '#/components/schemas/ReminderUpdate'
 *     responses:
 *       200:
 *         description: Reminder updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reminder not found
 *
 *   delete:
 *     summary: Delete reminder
 *     tags: [Reminders]
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
 *         description: Reminder deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reminder not found
 */

/**
 * @swagger
 * /api/v1/reminders/{id}/toggle:
 *   patch:
 *     summary: Toggle reminder active status
 *     tags: [Reminders]
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
 *         description: Reminder status toggled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reminder not found
 */

