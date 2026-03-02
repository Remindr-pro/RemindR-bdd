import { z } from "zod";

const optionalString = z
  .string()
  .transform((val) => val?.trim() || undefined)
  .optional();

export const createFamilyMemberSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .transform((val) => val.trim()),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    genderBirth: optionalString,
    genderActual: optionalString,
    profilePictureUrl: z.string().url("Invalid profile picture URL").optional(),
    profileLink: optionalString,
    profileColor: optionalString,
    email: z
      .string()
      .email("Invalid email address")
      .transform((val) => val.trim().toLowerCase())
      .optional(),
    createLogin: z.boolean().optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
  }),
});

export const updateFamilyMemberSchema = z.object({
  params: z.object({
    memberId: z.string().uuid("Invalid member ID format"),
  }),
  body: z
    .object({
      firstName: z
        .string()
        .min(1, "First name is required")
        .transform((val) => val.trim())
        .optional(),
      lastName: z
        .string()
        .min(1, "Last name is required")
        .transform((val) => val.trim())
        .optional(),
      dateOfBirth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
        .optional(),
      genderBirth: optionalString,
      genderActual: optionalString,
      profilePictureUrl: z.string().url("Invalid profile picture URL").optional(),
      profileLink: optionalString,
      profileColor: optionalString,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});

export const deleteFamilyMemberSchema = z.object({
  params: z.object({
    memberId: z.string().uuid("Invalid member ID format"),
  }),
});
