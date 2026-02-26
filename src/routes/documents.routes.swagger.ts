/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: Liste des documents de l'utilisateur et de sa famille
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des documents
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
 *                       documentType:
 *                         type: string
 *                       fileName:
 *                         type: string
 *                       sentToMutuelle:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Créer un document (facture, ordonnance, etc.)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - fileName
 *               - fileUrl
 *             properties:
 *               documentType:
 *                 type: string
 *                 example: invoice
 *               fileName:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               mimeType:
 *                 type: string
 *               insuranceCompanyId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Document créé
 *       400:
 *         description: Champs requis manquants
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/documents/{id}/send-to-mutuelle:
 *   post:
 *     summary: Envoyer un document à la mutuelle
 *     tags: [Documents]
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
 *             type: object
 *             properties:
 *               insuranceCompanyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID mutuelle (si non défini sur le document)
 *     responses:
 *       200:
 *         description: Document envoyé à la mutuelle
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Document non trouvé
 *       401:
 *         description: Unauthorized
 */
