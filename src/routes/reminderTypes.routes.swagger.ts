/**
 * @swagger
 * /api/v1/reminder-types:
 *   get:
 *     summary: List all reminder types
 *     tags: [Reminder Types]
 *     description: Returns all available reminder types (e.g. Medication, Appointment) for creating reminders
 *     responses:
 *       200:
 *         description: List of reminder types
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
 *                         example: Medication
 *                       category:
 *                         type: string
 *                         example: health
 *                       description:
 *                         type: string
 */
