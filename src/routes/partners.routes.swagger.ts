/**
 * @swagger
 * /api/v1/partners:
 *   get:
 *     summary: Liste des mutuelles et partenaires
 *     tags: [Partners]
 *     description: Retourne la liste des partenaires actifs (mutuelles, etc.) pour "Voir nos mutuelles partenaires"
 *     responses:
 *       200:
 *         description: Liste des partenaires
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       websiteUrl:
 *                         type: string
 *                       logoUrl:
 *                         type: string
 *                       contactEmail:
 *                         type: string
 */
