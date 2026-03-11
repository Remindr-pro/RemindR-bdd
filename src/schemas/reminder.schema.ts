import { z } from "zod";

const recurrenceSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  interval: z.number().min(1).optional(),
});

export const createReminderSchema = z.object({
  body: z.object({
    userId: z.string().uuid("Invalid user ID").optional(),
    typeId: z.string().uuid("Invalid reminder type ID"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    scheduledTime: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format (HH:MM:SS)"),
    recurrence: recurrenceSchema.optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
});

export const updateReminderSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid reminder ID"),
  }),
  body: z.object({
    typeId: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    scheduledTime: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/)
      .optional(),
    recurrence: recurrenceSchema.optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getReminderSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid reminder ID"),
  }),
});
