import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RemindR API',
      version: '1.0.0',
      description: 'API Backend for RemindR health application',
      contact: {
        name: 'RemindR Support',
        email: 'contact@remind-r.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
      {
        url: 'https://api.remind-r.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Reminders', description: 'Medical reminders' },
      { name: 'Reminder Types', description: 'Reminder type options' },
      { name: 'Health Profiles', description: 'Health profiles management' },
      { name: 'Articles', description: 'Health articles' },
      { name: 'Article Categories', description: 'Article category options' },
      { name: 'Recommendations', description: 'Personalized recommendations' },
      { name: 'Notifications', description: 'Notification logs' },
      { name: 'Questionnaire', description: 'User questionnaire' },
      { name: 'Families', description: 'Family management' },
      { name: 'Webhooks', description: 'Webhook management (Admin only)' },
      { name: 'Partners', description: 'Mutuelles et partenaires' },
      { name: 'Analytics', description: 'Dashboard B2B (Admin/Professional)' },
      { name: 'Documents', description: 'Documents et factures mutuelle' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.swagger.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

