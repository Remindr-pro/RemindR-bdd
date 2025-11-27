import { createReminderSchema, updateReminderSchema } from '../../schemas/reminder.schema';

describe('Reminder Schemas', () => {
  describe('createReminderSchema', () => {
    it('should validate correct reminder data', () => {
      const validData = {
        body: {
          typeId: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Reminder',
          description: 'Test description',
          scheduledTime: '09:00:00',
          recurrence: {
            frequency: 'daily',
          },
          startDate: '2024-01-01',
        },
      };

      const result = createReminderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const invalidData = {
        body: {
          typeId: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Reminder',
          scheduledTime: '9:00', // Invalid format
        },
      };

      const result = createReminderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for typeId', () => {
      const invalidData = {
        body: {
          typeId: 'invalid-uuid',
          title: 'Test Reminder',
          scheduledTime: '09:00:00',
        },
      };

      const result = createReminderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate recurrence object', () => {
      const validData = {
        body: {
          typeId: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Reminder',
          scheduledTime: '09:00:00',
          recurrence: {
            frequency: 'weekly',
            daysOfWeek: [1, 3, 5],
            interval: 2,
          },
        },
      };

      const result = createReminderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateReminderSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
        },
        body: {
          title: 'Updated Title',
          isActive: false,
        },
      };

      const result = updateReminderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require valid UUID in params', () => {
      const invalidData = {
        params: {
          id: 'invalid-id',
        },
        body: {
          title: 'Updated Title',
        },
      };

      const result = updateReminderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

