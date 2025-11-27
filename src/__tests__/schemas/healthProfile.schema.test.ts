import { createHealthProfileSchema, updateHealthProfileSchema } from '../../schemas/healthProfile.schema';

describe('Health Profile Schemas', () => {
  describe('createHealthProfileSchema', () => {
    it('should validate correct health profile data', () => {
      const validData = {
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          bloodType: 'O+',
          height: 175.5,
          weight: 70.0,
          allergies: ['Peanuts', 'Dust'],
          chronicConditions: ['Asthma'],
          medications: ['Vitamin D'],
        },
      };

      const result = createHealthProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for userId', () => {
      const invalidData = {
        body: {
          userId: 'invalid-uuid',
          bloodType: 'O+',
        },
      };

      const result = createHealthProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative height', () => {
      const invalidData = {
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          height: -10,
        },
      };

      const result = createHealthProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
        },
      };

      const result = createHealthProfileSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateHealthProfileSchema', () => {
    it('should validate partial update', () => {
      const validData = {
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
        },
        body: {
          bloodType: 'A+',
          weight: 75.0,
        },
      };

      const result = updateHealthProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

