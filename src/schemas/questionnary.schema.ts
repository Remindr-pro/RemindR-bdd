import { z } from 'zod';

export const createQuestionnarySchema = z.object({
  body: z.object({
    step: z.number().int().min(1).optional(),
    nbPersonsFollowed: z.number().int().min(1).optional(),
    hasGeneralPractitioner: z.boolean().optional(),
    generalPractitionerName: z.string().optional(),
    physicalActivityFrequency: z.string().optional(),
    dietType: z.string().optional(),
    usesAlternativeMedicine: z.boolean().optional(),
    alternativeMedicineTypes: z.array(z.string()).optional(),
    lastHealthCheck: z.string().optional(),
    enabledReminderTypes: z.array(z.string()).optional(),
    reminderFrequency: z.string().optional(),
    enabledNotificationChannels: z.array(z.string()).optional(),
  }),
});

export const updateQuestionnarySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid questionnary ID'),
  }),
  body: z.object({
    step: z.number().int().min(1).optional(),
    nbPersonsFollowed: z.number().int().min(1).optional(),
    hasGeneralPractitioner: z.boolean().optional(),
    generalPractitionerName: z.string().optional(),
    physicalActivityFrequency: z.string().optional(),
    dietType: z.string().optional(),
    usesAlternativeMedicine: z.boolean().optional(),
    alternativeMedicineTypes: z.array(z.string()).optional(),
    lastHealthCheck: z.string().optional(),
    enabledReminderTypes: z.array(z.string()).optional(),
    reminderFrequency: z.string().optional(),
    enabledNotificationChannels: z.array(z.string()).optional(),
  }),
});

